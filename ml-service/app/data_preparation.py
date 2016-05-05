import pandas as pd
from datetime import datetime, timezone
from sqlalchemy import text
from app.database import get_connection

def load_training_data():
    with get_connection() as conn:

        users = pd.read_sql(text("""
            SELECT Id, CreatedAt, DateNaissance
            FROM Users
            WHERE Role = 'Client'
        """), conn)

        abonnements = pd.read_sql(text("""
            SELECT Id, UserId, OffreId, ServiceId, Type, Montant, DateDebut, DateFin, Statut
            FROM Abonnements
            WHERE Statut = 'Expiré'
            ORDER BY DateDebut ASC
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

        # Age
        if pd.notna(user["DateNaissance"]):
            dob = pd.to_datetime(user["DateNaissance"])
            if dob.tzinfo is not None:
                dob = dob.replace(tzinfo=None)
            age = (now - dob).days // 365
        else:
            age = 30

        # Ancienneté
        created = pd.to_datetime(user["CreatedAt"])
        if created.tzinfo is not None:
            created = created.replace(tzinfo=None)
        anciennete = (now - created).days

        # Nombre abonnements total
        tous_user_abns = tous_abonnements[tous_abonnements["UserId"] == user_id]
        nb_abonnements_total = len(tous_user_abns)

        # Type abonnement
        type_abn = str(abn["Type"])
        if "annuel" in type_abn.lower() or "12" in type_abn:
            type_encoded = 1
        else:
            type_encoded = 0

        # Feedbacks
        user_feedbacks = feedbacks[feedbacks["ClientId"] == user_id]
        note_moyenne = user_feedbacks["Note"].mean() if not user_feedbacks.empty else 0.0
        a_feedback = 1 if not user_feedbacks.empty else 0

        # Paiements
        user_paiements = paiements[paiements["UserId"] == user_id]
        nb_failed = int((user_paiements["Statut"] == "failed").sum())
        montant_total = float(user_paiements[user_paiements["Statut"] == "completed"]["Montant"].sum())

        # Demandes
        user_demandes = demandes[demandes["ClientId"] == user_id]
        nb_acceptes = int((user_demandes["Statut"] == "acceptee").sum())

        # Label
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
            "type_abonnement": type_encoded,
            "note_moyenne": note_moyenne,
            "a_feedback": a_feedback,
            "nb_paiements_echoues": nb_failed,
            "nb_renouvellements_acceptes": nb_acceptes,
            "montant_total_paye": montant_total,
            "label": label,
        })

    df = pd.DataFrame(rows)
    print(f"Dataset charge : {len(df)} exemples, {df['label'].sum()} renewers, {(df['label']==0).sum()} churners")
    return df

def load_prediction_data():
    with get_connection() as conn:

        users = pd.read_sql(text("""
            SELECT Id, CreatedAt, DateNaissance
            FROM Users
            WHERE Role = 'Client'
        """), conn)

        abonnements = pd.read_sql(text("""
            SELECT Id, UserId, OffreId, ServiceId, Type, Montant, DateFin
            FROM Abonnements
            WHERE Statut = 'Actif'
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

        type_abn = str(abn["Type"])
        type_encoded = 1 if "annuel" in type_abn.lower() or "12" in type_abn else 0

        user_feedbacks = feedbacks[feedbacks["ClientId"] == user_id]
        note_moyenne = user_feedbacks["Note"].mean() if not user_feedbacks.empty else 0.0
        a_feedback = 1 if not user_feedbacks.empty else 0

        user_paiements = paiements[paiements["UserId"] == user_id]
        nb_failed = int((user_paiements["Statut"] == "failed").sum())
        montant_total = float(user_paiements[user_paiements["Statut"] == "completed"]["Montant"].sum())

        user_demandes = demandes[demandes["ClientId"] == user_id]
        nb_acceptes = int((user_demandes["Statut"] == "acceptee").sum())

        date_fin = pd.to_datetime(abn["DateFin"])
        if date_fin.tzinfo is not None:
            date_fin = date_fin.replace(tzinfo=None)
        jours_avant_expiration = (date_fin - now).days

        rows.append({
            "user_id": str(user_id),
            "abn_id": str(abn["Id"]),
            "jours_avant_expiration": jours_avant_expiration,
            "age": age,
            "anciennete": anciennete,
            "nb_abonnements_total": nb_abonnements_total,
            "type_abonnement": type_encoded,
            "note_moyenne": note_moyenne,
            "a_feedback": a_feedback,
            "nb_paiements_echoues": nb_failed,
            "nb_renouvellements_acceptes": nb_acceptes,
            "montant_total_paye": montant_total,
        })

    df = pd.DataFrame(rows)
    print(f"Donnees prediction chargees : {len(df)} clients actifs")
    return df