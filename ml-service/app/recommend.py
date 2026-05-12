import os
import unicodedata
import numpy as np
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import text
from app.database import get_connection

import nltk
nltk.download("stopwords", quiet=True)
from nltk.stem.snowball import SnowballStemmer
from nltk.corpus import stopwords

stemmer = SnowballStemmer("french")
stops   = set(stopwords.words("french"))

VECTORIZER_PATH = os.getenv("VECTORIZER_PATH", "models/tfidf_vectorizer.joblib")


def preprocess(text: str) -> str:
    text = text.lower()
    text = unicodedata.normalize("NFKD", text)\
                       .encode("ascii", "ignore")\
                       .decode("ascii")
    tokens = [
        stemmer.stem(t) for t in text.split()
        if t.isalpha()
        and t not in stops
        and not t.isnumeric()
        and len(t) > 1
    ]
    return " ".join(tokens)


def _charger_offres(conn) -> pd.DataFrame:
    offres_df = pd.read_sql(text("""
        SELECT
            LOWER(CAST(o.Id AS VARCHAR(36)))      AS item_id,
            o.IntituleOffre                        AS intitule,
            o.Description                          AS description,
            CAST(o.Prix AS FLOAT)                 AS prix,
            o.DureeEnMois                          AS duree_mois,
            ISNULL(u.SecteurActivite, 'General')  AS secteur,
            COUNT(DISTINCT so.ServiceId)           AS nb_services
        FROM Offres o
        LEFT JOIN Users u
            ON u.Username = o.CreePar AND u.Role = 'Responsable'
        LEFT JOIN ServiceOffres so ON so.OffreId = o.Id
        WHERE o.IsActive = 1
        GROUP BY o.Id, o.IntituleOffre, o.Description,
                 o.Prix, o.DureeEnMois, u.SecteurActivite
    """), conn)

    services_raw = pd.read_sql(text("""
        SELECT
            LOWER(CAST(so.OffreId AS VARCHAR(36)))         AS item_id,
            s.IntituleService + ' ' + s.Description        AS service_text
        FROM ServiceOffres so
        JOIN Services s ON s.Id  = so.ServiceId
        JOIN Offres   o ON o.Id  = so.OffreId
        WHERE o.IsActive = 1
    """), conn)

    services_agg = (services_raw
                    .groupby("item_id")["service_text"]
                    .apply(lambda x: " ".join(x))
                    .reset_index())

    offres_df = offres_df.merge(services_agg, on="item_id", how="left")
    offres_df["service_text"] = offres_df["service_text"].fillna("")
    offres_df["texte"] = (
        offres_df["intitule"]    + " " +
        offres_df["description"] + " " +
        offres_df["secteur"]     + " " +
        offres_df["service_text"]
    )
    offres_df["type"] = "offre"
    return offres_df


def _charger_services(conn) -> pd.DataFrame:
    svc_df = pd.read_sql(text("""
        SELECT
            LOWER(CAST(s.Id AS VARCHAR(36)))          AS item_id,
            s.IntituleService                          AS intitule,
            s.Description                              AS description,
            CAST(s.ParMois AS FLOAT)                  AS prix,
            ISNULL(u.SecteurActivite, 'General')      AS secteur
        FROM Services s
        LEFT JOIN Users u ON u.Id = s.ResponsableId
        WHERE s.IsActive = 1
    """), conn)

    svc_df["duree_mois"] = 1
    svc_df["nb_services"] = 0
    svc_df["texte"] = (
        svc_df["intitule"]    + " " +
        svc_df["description"] + " " +
        svc_df["secteur"]
    )
    svc_df["type"] = "service"
    return svc_df


def refit_vectorizer():
    with get_connection() as conn:
        offres_df   = _charger_offres(conn)
        services_df = _charger_services(conn)

    corpus = pd.concat([offres_df, services_df], ignore_index=True)
    textes = corpus["texte"].apply(preprocess).tolist()
    vec = TfidfVectorizer(max_features=300)
    vec.fit(textes)

    os.makedirs(os.path.dirname(VECTORIZER_PATH), exist_ok=True)
    joblib.dump(vec, VECTORIZER_PATH)
    print(f"Vectorizer refit — {len(textes)} items — {len(vec.vocabulary_)} tokens")


def _norm(col: pd.Series) -> pd.Series:
    lo, hi = col.min(), col.max()
    if hi == lo:
        return pd.Series([0.5] * len(col), index=col.index)
    return (col - lo) / (hi - lo)


def get_recommendations(user_id: str, top_n: int = 3) -> list[dict]:
    if not os.path.exists(VECTORIZER_PATH):
        raise FileNotFoundError(
            "Vectorizer non trouvé. Appelez /train-recommend d'abord.")

    vectorizer = joblib.load(VECTORIZER_PATH)

    with get_connection() as conn:
        offres_df   = _charger_offres(conn)
        services_df = _charger_services(conn)

        ratings_offres = pd.read_sql(text("""
            SELECT
                LOWER(CAST(a.OffreId AS VARCHAR(36))) AS item_id,
                AVG(CAST(f.Note AS FLOAT))            AS avg_rating
            FROM Feedbacks f
            JOIN Abonnements a ON a.Id = f.AbonnementId
            WHERE a.OffreId IS NOT NULL
            GROUP BY a.OffreId
        """), conn)

        ratings_services = pd.read_sql(text("""
            SELECT
                LOWER(CAST(a.ServiceId AS VARCHAR(36))) AS item_id,
                AVG(CAST(f.Note AS FLOAT))              AS avg_rating
            FROM Feedbacks f
            JOIN Abonnements a ON a.Id = f.AbonnementId
            WHERE a.ServiceId IS NOT NULL
            GROUP BY a.ServiceId
        """), conn)

        popularity_offres = pd.read_sql(text("""
            SELECT
                LOWER(CAST(OffreId AS VARCHAR(36))) AS item_id,
                COUNT(DISTINCT UserId)              AS nb_subscribers
            FROM Abonnements
            WHERE OffreId IS NOT NULL
            GROUP BY OffreId
        """), conn)

        popularity_services = pd.read_sql(text("""
            SELECT
                LOWER(CAST(ServiceId AS VARCHAR(36))) AS item_id,
                COUNT(DISTINCT UserId)                AS nb_subscribers
            FROM Abonnements
            WHERE ServiceId IS NOT NULL
            GROUP BY ServiceId
        """), conn)

        user_abonnements = pd.read_sql(text("""
            SELECT
                LOWER(CAST(a.OffreId AS VARCHAR(36)))   AS offre_id,
                LOWER(CAST(a.ServiceId AS VARCHAR(36))) AS service_id,
                a.Statut                                AS statut
            FROM Abonnements a
            WHERE LOWER(CAST(a.UserId AS VARCHAR(36))) = LOWER(:uid)
        """), conn, params={"uid": user_id})

    # ── Fusionner ratings et popularité ──────────────────────────────
    ratings    = pd.concat([ratings_offres,    ratings_services],    ignore_index=True)
    popularity = pd.concat([popularity_offres, popularity_services], ignore_index=True)

    all_items = pd.concat([offres_df, services_df], ignore_index=True)
    all_items = all_items.merge(ratings,    on="item_id", how="left")
    all_items = all_items.merge(popularity, on="item_id", how="left")
    all_items["avg_rating"]     = all_items["avg_rating"].fillna(3.0)
    all_items["nb_subscribers"] = all_items["nb_subscribers"].fillna(0)
    all_items = all_items.reset_index(drop=True)

    textes       = all_items["texte"].apply(preprocess).tolist()
    tfidf_matrix = vectorizer.transform(textes)

    # IDs déjà souscrits
    user_offre_ids   = set(user_abonnements["offre_id"].dropna().tolist())
    user_service_ids = set(user_abonnements["service_id"].dropna().tolist())
    already_ids      = user_offre_ids | user_service_ids

    candidate_mask = ~all_items["item_id"].isin(already_ids)

    POIDS_STATUT = {"Actif": 1.0, "Expiré": 0.3}

    # ── Profil client ────────────────────────────────────────────────
    profil      = np.zeros(tfidf_matrix.shape[1])
    total_poids = 0.0

    for _, row in user_abonnements.iterrows():
        for id_col in ["offre_id", "service_id"]:
            iid = row[id_col]
            if pd.isna(iid):
                continue
            m = all_items["item_id"] == iid
            if not m.any():
                continue
            idx          = all_items.index[m][0]
            p            = POIDS_STATUT.get(row["statut"], 0.3)
            profil      += p * tfidf_matrix[idx].toarray()[0]
            total_poids += p

    candidates = all_items[candidate_mask].copy().reset_index(drop=True)
    cand_matrix = tfidf_matrix[candidate_mask.values]

    if total_poids > 0:
        profil /= total_poids
        sim = cosine_similarity(profil.reshape(1, -1), cand_matrix)[0]
    else:
        sim = np.ones(len(candidates))

    candidates["similarity"] = sim
    candidates["sim_norm"]    = _norm(candidates["similarity"])
    candidates["rating_norm"] = _norm(candidates["avg_rating"])
    candidates["pop_norm"]    = _norm(candidates["nb_subscribers"])

    nb_abonnements = len(user_abonnements)

    if nb_abonnements <= 1:
        poids_sim, poids_pop = 0.4, 0.4
        if nb_abonnements == 1:
            first = user_abonnements.iloc[0]
            first_id = first["offre_id"] if not pd.isna(first["offre_id"]) else first["service_id"]
            if not pd.isna(first_id):
                m = all_items["item_id"] == first_id
                secteur_client = str(all_items[m]["secteur"].iat[0]) if m.any() else None
                candidates["score_bonus"] = candidates["secteur"].apply(
                    lambda s: 0.15 if s == secteur_client else 0.0
                ) if secteur_client else 0.0
            else:
                candidates["score_bonus"] = 0.0
        else:
            candidates["score_bonus"] = 0.0
    else:
        poids_sim, poids_pop      = 0.7, 0.1
        candidates["score_bonus"] = 0.0

    candidates["score"] = (
        poids_sim * candidates["sim_norm"]    +
        0.2       * candidates["rating_norm"] +
        poids_pop * candidates["pop_norm"]    +
        candidates["score_bonus"]
    )

    # ── Diversité : top 2 + 1 domaine différent ──────────────────────
    top_2                 = candidates.nlargest(2, "score").copy()
    top_2["is_diversity"] = False
    domaines_deja         = set(top_2["secteur"].tolist())

    reste = candidates[~candidates["secteur"].isin(domaines_deja)]
    if not reste.empty:
        top_1                 = reste.nlargest(1, "score").copy()
        top_1["is_diversity"] = True
        resultat              = pd.concat([top_2, top_1], ignore_index=True)
    else:
        resultat                 = candidates.nlargest(top_n, "score").copy()
        resultat["is_diversity"] = False

    reason = "popular" if total_poids == 0 else "similar"

    return [
        {
            "type":         row["type"],
            "item_id":      row["item_id"],
            "intitule":     row["intitule"],
            "description":  row["description"],
            "prix":         float(row["prix"]),
            "duree_mois":   int(row["duree_mois"]) if row["type"] == "offre" else None,
            "nb_services":  int(row["nb_services"]) if row["type"] == "offre" else None,
            "avg_rating":   round(float(row["avg_rating"]), 2),
            "secteur":      row["secteur"],
            "score":        round(float(row["score"]), 3),
            "is_diversity": bool(row["is_diversity"]),
            "reason":       reason,
        }
        for _, row in resultat.iterrows()
    ]