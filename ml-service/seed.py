import uuid
import random
from datetime import datetime, timedelta, timezone
from app.database import engine
from sqlalchemy import text

def random_date(start_days_ago, end_days_ago):
    days = random.randint(end_days_ago, start_days_ago)
    return datetime.now(timezone.utc) - timedelta(days=days)

def run_seed():
    with engine.connect() as conn:

        # ─── 1. RESPONSABLES ───────────────────────────────────────────
        resp1_id = str(uuid.uuid4())
        resp2_id = str(uuid.uuid4())

        for r in [
            {"id": resp1_id, "username": "Karim Mansour", "email": "resp1@seed.axia.tn"},
            {"id": resp2_id, "username": "Sonia Trabelsi", "email": "resp2@seed.axia.tn"},
        ]:
            conn.execute(text("""
                INSERT INTO Users (Id, Username, Email, PasswordHash, Role, Statut, IsActive, CreatedAt)
                VALUES (:id, :username, :email, 'SEED_NO_LOGIN', 'Responsable', 'Active', 1, :now)
            """), {**r, "now": datetime.now(timezone.utc)})

        # ─── 2. SERVICES ───────────────────────────────────────────────
        svc1_id = str(uuid.uuid4())
        svc2_id = str(uuid.uuid4())
        svc3_id = str(uuid.uuid4())
        svc4_id = str(uuid.uuid4())

        services = [
            {"id": svc1_id, "intitule": "Salle de Sport FitZone",        "desc": "Accès salle de sport complète",         "par_mois": 59.00,  "par_annee": 590.00, "resp": resp1_id, "cree_par": "Karim Mansour"},
            {"id": svc2_id, "intitule": "Espace Coworking HubWork",       "desc": "Espace de travail collaboratif",        "par_mois": 150.00, "par_annee": 1500.00,"resp": resp1_id, "cree_par": "Karim Mansour"},
            {"id": svc3_id, "intitule": "Bibliothèque Numérique ReadPlus","desc": "Accès illimité à la bibliothèque",      "par_mois": 20.00,  "par_annee": 200.00, "resp": resp2_id, "cree_par": "Sonia Trabelsi"},
            {"id": svc4_id, "intitule": "Studio Yoga & Bien-être ZenSpace","desc": "Séances yoga et méditation guidées",   "par_mois": 65.00,  "par_annee": 650.00, "resp": resp2_id, "cree_par": "Sonia Trabelsi"},
        ]

        for s in services:
            conn.execute(text("""
                INSERT INTO Services (Id, IntituleService, Description, CreePar, IsActive, CreatedAt, ParMois, ParAnnee, ResponsableId)
                VALUES (:id, :intitule, :desc, :cree_par, 1, :now, :par_mois, :par_annee, :resp)
            """), {**s, "now": datetime.now(timezone.utc)})

        # ─── 3. OFFRES ─────────────────────────────────────────────────
        offre1_id = str(uuid.uuid4())
        offre2_id = str(uuid.uuid4())
        offre3_id = str(uuid.uuid4())
        offre4_id = str(uuid.uuid4())

        offres = [
            {"id": offre1_id, "intitule": "Pack Sport Mensuel",       "desc": "Accès sport 1 mois",         "prix": 59.00,  "duree": 1,  "cree_par": "Karim Mansour"},
            {"id": offre2_id, "intitule": "Pack Coworking Trimestriel","desc": "Coworking 3 mois",           "prix": 450.00, "duree": 3,  "cree_par": "Karim Mansour"},
            {"id": offre3_id, "intitule": "Pack Lecture Semestriel",   "desc": "Lecture numérique 6 mois",   "prix": 120.00, "duree": 6,  "cree_par": "Sonia Trabelsi"},
            {"id": offre4_id, "intitule": "Pack Zen Annuel",           "desc": "Yoga & bien-être 12 mois",   "prix": 699.00, "duree": 12, "cree_par": "Sonia Trabelsi"},
        ]

        for o in offres:
            conn.execute(text("""
                INSERT INTO Offres (Id, IntituleOffre, Description, Prix, DureeEnMois, CreePar, IsActive, CreatedAt)
                VALUES (:id, :intitule, :desc, :prix, :duree, :cree_par, 1, :now)
            """), {**o, "now": datetime.now(timezone.utc)})

        # ─── 4. SERVICE OFFRES ─────────────────────────────────────────
        for svc_id, offre_id in [
            (svc1_id, offre1_id),
            (svc2_id, offre2_id),
            (svc3_id, offre3_id),
            (svc4_id, offre4_id),
        ]:
            conn.execute(text("""
                INSERT INTO ServiceOffres (ServiceId, OffreId) VALUES (:s, :o)
            """), {"s": svc_id, "o": offre_id})

        all_services = [svc1_id, svc2_id, svc3_id, svc4_id]
        all_offres   = [offre1_id, offre2_id, offre3_id, offre4_id]
        offre_prix   = {offre1_id: 59.00, offre2_id: 450.00, offre3_id: 120.00, offre4_id: 699.00}
        offre_duree  = {offre1_id: 1,     offre2_id: 3,      offre3_id: 6,      offre4_id: 12}
        svc_prix     = {svc1_id: 59.00,  svc2_id: 150.00, svc3_id: 20.00, svc4_id: 65.00}

        # ─── 5. CHURNERS (70) ──────────────────────────────────────────
        for i in range(70):
            user_id    = str(uuid.uuid4())
            created_at = random_date(150, 30)
            birth_date = datetime.now(timezone.utc) - timedelta(days=random.randint(18*365, 35*365))

            conn.execute(text("""
                INSERT INTO Users (Id, Username, Email, PasswordHash, Role, Statut, IsActive, CreatedAt, DateNaissance)
                VALUES (:id, :username, :email, 'SEED_NO_LOGIN', 'Client', 'Active', 1, :created_at, :dob)
            """), {"id": user_id, "username": f"Churner{i+1}", "email": f"churner{i+1}@seed.axia.tn",
                   "created_at": created_at, "dob": birth_date})

            use_offre  = random.random() > 0.5
            service_id = random.choice(all_services)
            offre_id   = random.choice(all_offres)
            montant    = offre_prix[offre_id] if use_offre else svc_prix[service_id]
            duree_days = offre_duree[offre_id] * 30 if use_offre else 30

            date_debut = created_at + timedelta(days=random.randint(1, 10))
            date_fin   = date_debut + timedelta(days=duree_days)
            abn_id     = str(uuid.uuid4())

            conn.execute(text("""
                INSERT INTO Abonnements (Id, UserId, OffreId, ServiceId, Type, Montant, DateDebut, DateFin, IsActive, Statut, CreatedAt)
                VALUES (:id, :user_id, :offre_id, :service_id, :type, :montant, :date_debut, :date_fin, 0, 'Expiré', :date_debut)
            """), {"id": abn_id, "user_id": user_id,
                   "offre_id": offre_id if use_offre else None,
                   "service_id": None if use_offre else service_id,
                   "type": f"{offre_duree[offre_id]} mois" if use_offre else "mensuel",
                   "montant": montant, "date_debut": date_debut, "date_fin": date_fin})

            # Paiements échoués
            for _ in range(random.randint(1, 3)):
                conn.execute(text("""
                    INSERT INTO Paiements (Id, AbonnementId, UserId, Montant, Statut, CreatedAt, PaymentType)
                    VALUES (:id, :abn_id, :user_id, :montant, 'failed', :created_at, 'subscription')
                """), {"id": str(uuid.uuid4()), "abn_id": abn_id, "user_id": user_id,
                       "montant": montant,
                       "created_at": date_debut + timedelta(days=random.randint(1, max(1, duree_days-2)))})

            # Feedback (50% chance, note basse)
            if random.random() > 0.5:
                conn.execute(text("""
                    INSERT INTO Feedbacks (Id, ClientId, AbonnementId, Note, CreatedAt)
                    VALUES (:id, :client_id, :abn_id, :note, :created_at)
                """), {"id": str(uuid.uuid4()), "client_id": user_id, "abn_id": abn_id,
                       "note": random.randint(1, 2),
                       "created_at": date_fin - timedelta(days=random.randint(1, 5))})

            # Demande refusée (50% chance)
            if random.random() > 0.5:
                conn.execute(text("""
                    INSERT INTO DemandesRenouvellement (Id, AbonnementId, ClientId, Statut, CreatedAt)
                    VALUES (:id, :abn_id, :client_id, 'refusée', :created_at)
                """), {"id": str(uuid.uuid4()), "abn_id": abn_id, "client_id": user_id,
                       "created_at": date_fin - timedelta(days=2)})

        # ─── 6. RENEWERS (70) ──────────────────────────────────────────
        for i in range(70):
            user_id    = str(uuid.uuid4())
            created_at = random_date(730, 180)
            birth_date = datetime.now(timezone.utc) - timedelta(days=random.randint(25*365, 55*365))

            conn.execute(text("""
                INSERT INTO Users (Id, Username, Email, PasswordHash, Role, Statut, IsActive, CreatedAt, DateNaissance)
                VALUES (:id, :username, :email, 'SEED_NO_LOGIN', 'Client', 'Active', 1, :created_at, :dob)
            """), {"id": user_id, "username": f"Renewer{i+1}", "email": f"renewer{i+1}@seed.axia.tn",
                   "created_at": created_at, "dob": birth_date})

            use_offre  = random.random() > 0.5
            service_id = random.choice(all_services)
            offre_id   = random.choice(all_offres)
            montant    = offre_prix[offre_id] if use_offre else svc_prix[service_id] * 12
            duree_days = offre_duree[offre_id] * 30 if use_offre else 365

            # Premier abonnement (expiré)
            date_debut1 = created_at + timedelta(days=random.randint(1, 10))
            date_fin1   = date_debut1 + timedelta(days=duree_days)
            abn1_id     = str(uuid.uuid4())

            conn.execute(text("""
                INSERT INTO Abonnements (Id, UserId, OffreId, ServiceId, Type, Montant, DateDebut, DateFin, IsActive, Statut, CreatedAt)
                VALUES (:id, :user_id, :offre_id, :service_id, :type, :montant, :date_debut, :date_fin, 0, 'Expiré', :date_debut)
            """), {"id": abn1_id, "user_id": user_id,
                   "offre_id": offre_id if use_offre else None,
                   "service_id": None if use_offre else service_id,
                   "type": f"{offre_duree[offre_id]} mois" if use_offre else "annuel",
                   "montant": montant, "date_debut": date_debut1, "date_fin": date_fin1})

            conn.execute(text("""
                INSERT INTO Paiements (Id, AbonnementId, UserId, Montant, Statut, CreatedAt, PaymentType)
                VALUES (:id, :abn_id, :user_id, :montant, 'completed', :created_at, 'subscription')
            """), {"id": str(uuid.uuid4()), "abn_id": abn1_id, "user_id": user_id,
                   "montant": montant, "created_at": date_debut1})

            conn.execute(text("""
                INSERT INTO Feedbacks (Id, ClientId, AbonnementId, Note, CreatedAt)
                VALUES (:id, :client_id, :abn_id, :note, :created_at)
            """), {"id": str(uuid.uuid4()), "client_id": user_id, "abn_id": abn1_id,
                   "note": random.randint(4, 5),
                   "created_at": date_fin1 - timedelta(days=random.randint(5, 30))})

            conn.execute(text("""
                INSERT INTO DemandesRenouvellement (Id, AbonnementId, ClientId, Statut, CreatedAt)
                VALUES (:id, :abn_id, :client_id, 'acceptée', :created_at)
            """), {"id": str(uuid.uuid4()), "abn_id": abn1_id, "client_id": user_id,
                   "created_at": date_fin1 - timedelta(days=5)})

            # Deuxième abonnement (renouvellement actif)
            date_debut2 = date_fin1 + timedelta(days=random.randint(1, 10))
            date_fin2   = date_debut2 + timedelta(days=duree_days)
            abn2_id     = str(uuid.uuid4())

            conn.execute(text("""
                INSERT INTO Abonnements (Id, UserId, OffreId, ServiceId, Type, Montant, DateDebut, DateFin, IsActive, Statut, CreatedAt)
                VALUES (:id, :user_id, :offre_id, :service_id, :type, :montant, :date_debut, :date_fin, 1, 'Actif', :date_debut)
            """), {"id": abn2_id, "user_id": user_id,
                   "offre_id": offre_id if use_offre else None,
                   "service_id": None if use_offre else service_id,
                   "type": f"{offre_duree[offre_id]} mois" if use_offre else "annuel",
                   "montant": montant, "date_debut": date_debut2, "date_fin": date_fin2})

            conn.execute(text("""
                INSERT INTO Paiements (Id, AbonnementId, UserId, Montant, Statut, CreatedAt, PaymentType)
                VALUES (:id, :abn_id, :user_id, :montant, 'completed', :created_at, 'renewal')
            """), {"id": str(uuid.uuid4()), "abn_id": abn2_id, "user_id": user_id,
                   "montant": montant, "created_at": date_debut2})

        # ─── 7. ACTIFS (15) ────────────────────────────────────────────
        expiry_groups = [(1, 29), (30, 60), (61, 120)]

        for group_idx, (min_days, max_days) in enumerate(expiry_groups):
            for i in range(5):
                user_id    = str(uuid.uuid4())
                created_at = random_date(365, 90)
                birth_date = datetime.now(timezone.utc) - timedelta(days=random.randint(20*365, 50*365))

                conn.execute(text("""
                    INSERT INTO Users (Id, Username, Email, PasswordHash, Role, Statut, IsActive, CreatedAt, DateNaissance)
                    VALUES (:id, :username, :email, 'SEED_NO_LOGIN', 'Client', 'Active', 1, :created_at, :dob)
                """), {"id": user_id, "username": f"Actif{group_idx*5+i+1}",
                       "email": f"actif{group_idx*5+i+1}@seed.axia.tn",
                       "created_at": created_at, "dob": birth_date})

                use_offre  = random.random() > 0.5
                service_id = random.choice(all_services)
                offre_id   = random.choice(all_offres)
                montant    = offre_prix[offre_id] if use_offre else svc_prix[service_id]
                duree_days = offre_duree[offre_id] * 30 if use_offre else 30

                days_until_expiry = random.randint(min_days, max_days)
                date_fin   = datetime.now(timezone.utc) + timedelta(days=days_until_expiry)
                date_debut = date_fin - timedelta(days=duree_days)
                abn_id     = str(uuid.uuid4())

                conn.execute(text("""
                    INSERT INTO Abonnements (Id, UserId, OffreId, ServiceId, Type, Montant, DateDebut, DateFin, IsActive, Statut, CreatedAt)
                    VALUES (:id, :user_id, :offre_id, :service_id, :type, :montant, :date_debut, :date_fin, 1, 'Actif', :date_debut)
                """), {"id": abn_id, "user_id": user_id,
                       "offre_id": offre_id if use_offre else None,
                       "service_id": None if use_offre else service_id,
                       "type": f"{offre_duree[offre_id]} mois" if use_offre else "mensuel",
                       "montant": montant, "date_debut": date_debut, "date_fin": date_fin})

                conn.execute(text("""
                    INSERT INTO Paiements (Id, AbonnementId, UserId, Montant, Statut, CreatedAt, PaymentType)
                    VALUES (:id, :abn_id, :user_id, :montant, 'completed', :created_at, 'subscription')
                """), {"id": str(uuid.uuid4()), "abn_id": abn_id, "user_id": user_id,
                       "montant": montant, "created_at": date_debut})

        conn.commit()
        print("✅ Seed terminé avec succès !")
        print("   - 2 responsables")
        print("   - 4 services + 4 offres")
        print("   - 70 churners")
        print("   - 70 renewers")
        print("   - 15 clients actifs")
        print("   Total : 157 utilisateurs")

if __name__ == "__main__":
    run_seed()