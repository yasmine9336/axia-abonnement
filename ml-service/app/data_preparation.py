import pandas as pd
from datetime import datetime, timezone
from sqlalchemy import text
from app.database import get_connection

def load_training_data():
    with get_connection() as conn:

        # ─── Users ────────────────────────────────────────────────────
        users = pd.read_sql(text("""
            SELECT Id, CreatedAt, DateNaissance
            FROM Users
            WHERE Role = 'Client'
            AND Email LIKE '%@seed.axia.tn%'
            AND Email NOT LIKE 'actif%@seed.axia.tn'
        """), conn)

        # ─── Abonnements ──────────────────────────────────────────────
        abonnements = pd.read_sql(text("""
            SELECT Id, UserId, OffreId, ServiceId, Type, Montant,
                   DateDebut, DateFin, Statut
            FROM Abonnements
            WHERE Statut = 'Expiré'
        """), conn)

        # ─── Paiements ────────────────────────────────────────────────
        paiements = pd.read_sql(text("""
            SELECT AbonnementId, UserId, Montant, Statut
            FROM Paiements
        """), conn)

        # ─── Feedbacks ────────────────────────────────────────────────
        feedbacks = pd.read_sql(text("""
            SELECT ClientId, AbonnementId, Note
            FROM Feedbacks
        """), conn)

        # ─── Demandes ─────────────────────────────────────────────────
        demandes = pd.read_sql(text("""
            SELECT AbonnementId, ClientId, Statut
            FROM DemandesRenouvellement
        """), conn)

        # ─── Tous abonnements (pour label) ────────────────────────────
        tous_abonnements = pd.read_sql(text("""
            SELECT Id, UserId, DateDebut, DateFin, Statut
            FROM Abonnements
        """), conn)

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    rows = []

    for _, user in users.iterrows():
        user_id = user["Id"]

        # Abonnements expirés de ce user
        user_abns = abonnements[abonnements["UserId"] == user_id]
        if user_abns.empty:
            continue

        # Prendre le premier abonnement expiré
        abn = user_abns.iloc[0]
        abn_id = abn["Id"]

        # ── Feature 1 : Âge ──────────────────────────────────────────
        dob = abn["DateDebut"]  # fallback
        if pd.notna(user["DateNaissance"]):
            dob = pd.to_datetime(user["DateNaissance"])
            if dob.tzinfo is not None:
                dob = dob.replace(tzinfo=None)
            age = (now - dob).days // 365
        else:
            age = 30  # valeur par défaut

        # ── Feature 2 : Ancienneté ───────────────────────────────────
        created = pd.to_datetime(user["CreatedAt"])
        if created.tzinfo is not None:
            created = created.replace(tzinfo=None)
        anciennete = (now - created).days

        # ── Feature 3 : Nb abonnements total ─────────────────────────
        tous_user_abns = tous_abonnements[tous_abonnements["UserId"] == user_id]
        nb_abonnements_total = len(tous_user_abns)

        # ── Feature 4 : Nb abonnements par service ───────────────────
        nb_par_service = user_abns["ServiceId"].notna().sum()

        # ── Feature 5 : Nb abonnements par offre ─────────────────────
        nb_par_offre = user_abns["OffreId"].notna().sum()

        # ── Feature 6 : Jours avant expiration (0 pour training) ─────
        jours_avant_expiration = 0

        # ── Feature 7 : Type abonnement ──────────────────────────────
        type_abn = abn["Type"]
        if "annuel" in str(type_abn).lower() or "12" in str(type_abn):
            type_encoded = 1
        else:
            type_encoded = 0

        # ── Feature 8 : Note feedback moyenne ────────────────────────
        user_feedbacks = feedbacks[feedbacks["ClientId"] == user_id]
        if not user_feedbacks.empty:
            note_moyenne = user_feedbacks["Note"].mean()
        else:
            note_moyenne = 0.0

        # ── Feature 9 : A donné un feedback ──────────────────────────
        a_feedback = 1 if not user_feedbacks.empty else 0

        # ── Feature 10 : Nb paiements échoués ────────────────────────
        user_paiements = paiements[paiements["UserId"] == user_id]
        nb_failed = (user_paiements["Statut"] == "failed").sum()

        # ── Feature 11 : Nb renouvellements acceptés ─────────────────
        user_demandes = demandes[demandes["ClientId"] == user_id]
        nb_acceptes = (user_demandes["Statut"] == "acceptée").sum()

        # ── Feature 12 : Nb renouvellements refusés ──────────────────
        nb_refuses = (user_demandes["Statut"] == "refusée").sum()

        # ── Feature 13 : Montant total payé ──────────────────────────
        completed = user_paiements[user_paiements["Statut"] == "completed"]
        montant_total = completed["Montant"].sum()

        # ── Label ─────────────────────────────────────────────────────
        # 1 si le user a un abonnement créé APRÈS la fin du premier
        date_fin = pd.to_datetime(abn["DateFin"])
        if date_fin.tzinfo is not None:
            date_fin = date_fin.replace(tzinfo=None)

        renewals = tous_user_abns[
            pd.to_datetime(tous_user_abns["DateDebut"]).apply(
                lambda d: d.replace(tzinfo=None) if d.tzinfo is not None else d
            ) > date_fin
        ]
        label = 1 if not renewals.empty else 0

        rows.append({
            "age": age,
            "anciennete": anciennete,
            "nb_abonnements_total": nb_abonnements_total,
            "nb_par_service": nb_par_service,
            "nb_par_offre": nb_par_offre,
            "jours_avant_expiration": jours_avant_expiration,
            "type_abonnement": type_encoded,
            "note_moyenne": note_moyenne,
            "a_feedback": a_feedback,
            "nb_paiements_echoues": int(nb_failed),
            "nb_renouvellements_acceptes": int(nb_acceptes),
            "nb_renouvellements_refuses": int(nb_refuses),
            "montant_total_paye": float(montant_total),
            "label": label,
        })

    df = pd.DataFrame(rows)
    print(f"✅ Dataset chargé : {len(df)} exemples, {df['label'].sum()} renewers, {(df['label']==0).sum()} churners")
    return df


def load_prediction_data():
    with get_connection() as conn:

        users = pd.read_sql(text("""
            SELECT Id, CreatedAt, DateNaissance
            FROM Users
            WHERE Email LIKE 'actif%@seed.axia.tn'
        """), conn)

        abonnements = pd.read_sql(text("""
            SELECT Id, UserId, OffreId, ServiceId, Type, Montant, DateFin
            FROM Abonnements
            WHERE Statut = 'Actif'
            AND UserId IN (
                SELECT Id FROM Users WHERE Email LIKE 'actif%@seed.axia.tn'
            )
        """), conn)

        paiements = pd.read_sql(text("""
            SELECT AbonnementId, UserId, Montant, Statut
            FROM Paiements
        """), conn)

        feedbacks = pd.read_sql(text("""
            SELECT ClientId, AbonnementId, Note
            FROM Feedbacks
        """), conn)

        demandes = pd.read_sql(text("""
            SELECT AbonnementId, ClientId, Statut
            FROM DemandesRenouvellement
        """), conn)

        tous_abonnements = pd.read_sql(text("""
            SELECT Id, UserId, DateDebut, DateFin, Statut
            FROM Abonnements
        """), conn)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    rows = []

    for _, user in users.iterrows():
        user_id = user["Id"]
        user_abns = abonnements[abonnements["UserId"] == user_id]
        if user_abns.empty:
            continue

        abn = user_abns.iloc[0]
        abn_id = abn["Id"]

        if pd.notna(user["DateNaissance"]):
            dob = pd.to_datetime(user["DateNaissance"])
            if dob.tzinfo is not None:
                dob = dob.replace(tzinfo=None)
            age = (now - dob).days // 365
        else:
            age = 30

        created = pd.to_datetime(user["CreatedAt"])
        if created.tzinfo is not None:
            created = created.replace(tzinfo=None)
        anciennete = (now - created).days

        tous_user_abns = tous_abonnements[tous_abonnements["UserId"] == user_id]
        nb_abonnements_total = len(tous_user_abns)
        nb_par_service = user_abns["ServiceId"].notna().sum()
        nb_par_offre = user_abns["OffreId"].notna().sum()

        date_fin = pd.to_datetime(abn["DateFin"])
        if date_fin.tzinfo is not None:
            date_fin = date_fin.replace(tzinfo=None)
        jours_avant_expiration = (date_fin - now).days

        type_abn = abn["Type"]
        type_encoded = 1 if "annuel" in str(type_abn).lower() or "12" in str(type_abn) else 0

        user_feedbacks = feedbacks[feedbacks["ClientId"] == user_id]
        note_moyenne = user_feedbacks["Note"].mean() if not user_feedbacks.empty else 0.0
        a_feedback = 1 if not user_feedbacks.empty else 0

        user_paiements = paiements[paiements["UserId"] == user_id]
        nb_failed = (user_paiements["Statut"] == "failed").sum()

        user_demandes = demandes[demandes["ClientId"] == user_id]
        nb_acceptes = (user_demandes["Statut"] == "acceptée").sum()
        nb_refuses = (user_demandes["Statut"] == "refusée").sum()

        completed = user_paiements[user_paiements["Statut"] == "completed"]
        montant_total = completed["Montant"].sum()

        rows.append({
            "user_id": str(user_id),
            "abn_id": str(abn_id),
            "jours_avant_expiration": jours_avant_expiration,
            "age": age,
            "anciennete": anciennete,
            "nb_abonnements_total": nb_abonnements_total,
            "nb_par_service": nb_par_service,
            "nb_par_offre": nb_par_offre,
            "type_abonnement": type_encoded,
            "note_moyenne": note_moyenne,
            "a_feedback": a_feedback,
            "nb_paiements_echoues": int(nb_failed),
            "nb_renouvellements_acceptes": int(nb_acceptes),
            "nb_renouvellements_refuses": int(nb_refuses),
            "montant_total_paye": float(montant_total),
        })

    df = pd.DataFrame(rows)
    print(f"✅ Données prédiction chargées : {len(df)} clients actifs")
    return df