import uuid
import random
from datetime import datetime, timedelta, timezone
from app.database import engine
from sqlalchemy import text

random.seed(42)
NOW = datetime.now(timezone.utc)


def rand_dob(min_age, max_age):
    days = random.randint(min_age * 365, max_age * 365) + random.randint(0, 364)
    return NOW - timedelta(days=days)

def hash_password(password):
    import os, struct, hashlib, base64
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000, dklen=32)
    header = struct.pack('>BIII', 0x01, 1, 100000, 16)
    return base64.b64encode(header + salt + key).decode('utf-8')

def run_seed():
    with engine.connect() as conn:

        # ── NETTOYAGE ─────────────────────────────────────────────────
        print("Nettoyage des anciennes données seed...")
        conn.execute(text("DELETE FROM DemandesRenouvellement WHERE ClientId IN (SELECT Id FROM Users WHERE Email LIKE '%@seed.axia.tn')"))
        conn.execute(text("DELETE FROM Feedbacks WHERE ClientId IN (SELECT Id FROM Users WHERE Email LIKE '%@seed.axia.tn')"))
        conn.execute(text("DELETE FROM Paiements WHERE UserId IN (SELECT Id FROM Users WHERE Email LIKE '%@seed.axia.tn')"))
        conn.execute(text("DELETE FROM Abonnements WHERE UserId IN (SELECT Id FROM Users WHERE Email LIKE '%@seed.axia.tn')"))
        conn.execute(text("DELETE FROM ServiceOffres WHERE ServiceId IN (SELECT Id FROM Services WHERE CreePar IN (SELECT Username FROM Users WHERE Email LIKE '%@seed.axia.tn' AND Role = 'Responsable'))"))
        conn.execute(text("DELETE FROM Services WHERE CreePar IN (SELECT Username FROM Users WHERE Email LIKE '%@seed.axia.tn' AND Role = 'Responsable')"))
        conn.execute(text("DELETE FROM Offres WHERE CreePar IN (SELECT Username FROM Users WHERE Email LIKE '%@seed.axia.tn' AND Role = 'Responsable')"))
        conn.execute(text("""
            DELETE FROM ChatMessages
            WHERE ConversationId IN (
            SELECT Id FROM ChatConversations
            WHERE ClientId IN (SELECT Id FROM Users WHERE Email LIKE '%@seed.axia.tn')
            OR AssignedResponsableId IN (SELECT Id FROM Users WHERE Email LIKE '%@seed.axia.tn')
            )
        """))
        conn.execute(text("""
            DELETE FROM ChatConversations
            WHERE ClientId IN (SELECT Id FROM Users WHERE Email LIKE '%@seed.axia.tn')
            OR AssignedResponsableId IN (SELECT Id FROM Users WHERE Email LIKE '%@seed.axia.tn')
        """))
        conn.execute(text("DELETE FROM Users WHERE Email LIKE '%@seed.axia.tn'"))
        conn.commit()
        print("Nettoyage terminé")

        # ── RESPONSABLES ──────────────────────────────────────────────
        resp_catalog = [
            ("Karim Mansour",  "karim@seed.axia.tn"),
            ("Sonia Trabelsi", "sonia@seed.axia.tn"),
            ("Ahmed Belhaj",   "ahmed@seed.axia.tn"),
            ("Leila Bouazizi", "leila@seed.axia.tn"),
            ("Youssef Gharbi", "youssef@seed.axia.tn"),
        ]
        resp_ids = []
        resp_names = []
        for name, email in resp_catalog:
            rid = str(uuid.uuid4())
            resp_ids.append(rid)
            resp_names.append(name)
            conn.execute(text("""
                INSERT INTO Users (Id, Username, Email, PasswordHash, Role, Statut, IsActive, CreatedAt)
                VALUES (:id, :name, :email, :pwd, 'Responsable', 'Active', 1, :now)
            """), {"id": rid, "name": name, "email": email, "pwd": hash_password('Seed1234!'), "now": NOW})

        print("5 responsables créés")

        # ── SERVICES ──────────────────────────────────────────────────
        svc_catalog = [
            ("Salle de Sport FitZone",          "Acces sport complet + coaching",         59.00,  590.00,  0),
            ("Espace Coworking HubWork",         "Espace de travail collaboratif premium", 150.00, 1500.00, 0),
            ("Bibliotheque Numerique ReadPlus",  "Acces illimite livres et articles",      20.00,  200.00,  1),
            ("Studio Yoga ZenSpace",             "Seances yoga et meditation guidees",     65.00,  650.00,  1),
            ("Cours de Langue LinguaLearn",      "Cours en ligne multi-langues",           35.00,  350.00,  2),
            ("Plateforme eLearning TechBoost",   "Formations tech et certifications",      45.00,  450.00,  2),
            ("Piscine Aqua-Fitness AquaVie",     "Acces piscine et cours aquatiques",      55.00,  550.00,  3),
            ("Studio Photo Video CreaPix",       "Location studio et montage video",       80.00,  800.00,  3),
            ("Espace Musique MelodyHub",         "Cours instruments et studio",            70.00,  700.00,  4),
            ("Club de Lecture LitCircle",        "Club lecture avec livraison mensuelle",  25.00,  250.00,  4),
            ("Salle de Danse DancePulse",        "Cours de danse tous styles",             50.00,  500.00,  0),
            ("Centre Meditation MindfulZone",    "Meditation guidee anti-stress",          30.00,  300.00,  1),
        ]
        svc_ids = []
        svc_prix = {}
        for nom, desc, pm, pa, ri in svc_catalog:
            sid = str(uuid.uuid4())
            svc_ids.append(sid)
            svc_prix[sid] = pm
            conn.execute(text("""
                INSERT INTO Services (Id, IntituleService, Description, CreePar, IsActive, CreatedAt, ParMois, ParAnnee, ResponsableId)
                VALUES (:id, :nom, :desc, :cree, 1, :now, :pm, :pa, :rid)
            """), {"id": sid, "nom": nom, "desc": desc, "cree": resp_names[ri],
                   "now": NOW, "pm": pm, "pa": pa, "rid": resp_ids[ri]})

        print("12 services crees")

        # ── OFFRES ────────────────────────────────────────────────────
        offre_catalog = [
            ("Acces Mensuel Sport",        "Sport 1 mois sans engagement",        59.00,  1,  0),
            ("Pack Trimestriel Sport",     "3 mois sport tarif reduit",           160.00, 3,  0),
            ("Pack Annuel Sport Premium",  "12 mois sport + coaching perso",      590.00, 12, 0),
            ("Coworking Mensuel",          "Coworking 1 mois",                    150.00, 1,  0),
            ("Coworking Trimestriel",      "3 mois + salle de conference",        420.00, 3,  0),
            ("Lecture Semestriel",         "6 mois bibliotheque numerique",       110.00, 6,  1),
            ("Lecture Annuel",             "12 mois acces illimite",              200.00, 12, 1),
            ("Yoga Mensuel Debutant",      "1 mois yoga debutants",               65.00,  1,  1),
            ("Yoga Pack Trimestriel",      "3 mois yoga toutes seances",          180.00, 3,  1),
            ("Formation Tech Mensuel",     "1 mois formations tech illimitees",   45.00,  1,  2),
            ("Formation Tech Annuel",      "12 mois + certification incluse",     450.00, 12, 2),
            ("Langue Pack Semestriel",     "6 mois cours intensif",               190.00, 6,  2),
        ]
        offre_ids = []
        offre_prix = {}
        offre_duree = {}
        for nom, desc, prix, duree, ri in offre_catalog:
            oid = str(uuid.uuid4())
            offre_ids.append(oid)
            offre_prix[oid] = prix
            offre_duree[oid] = duree
            conn.execute(text("""
                INSERT INTO Offres (Id, IntituleOffre, Description, Prix, DureeEnMois, CreePar, IsActive, CreatedAt)
                VALUES (:id, :nom, :desc, :prix, :duree, :cree, 1, :now)
            """), {"id": oid, "nom": nom, "desc": desc, "prix": prix, "duree": duree,
                   "cree": resp_names[ri], "now": NOW})

        print("12 offres creees")

        # ── LIENS SERVICE-OFFRE ───────────────────────────────────────
        for si, oi in [(0,0),(0,1),(0,2),(1,3),(1,4),(2,5),(2,6),
                       (3,7),(3,8),(4,11),(5,9),(5,10)]:
            conn.execute(text(
                "INSERT INTO ServiceOffres (ServiceId, OffreId) VALUES (:s, :o)"
            ), {"s": svc_ids[si], "o": offre_ids[oi]})

        print("Liens service-offre crees")

        # ── HELPERS ───────────────────────────────────────────────────
        def offres_max(max_mois):
            ok = [o for o in offre_ids if offre_duree[o] <= max_mois]
            return ok if ok else [o for o in offre_ids if offre_duree[o] == 1]

        def new_user(username, email, created_at, dob):
            uid = str(uuid.uuid4())
            conn.execute(text("""
                INSERT INTO Users (Id, Username, Email, PasswordHash, Role, Statut, IsActive, CreatedAt, DateNaissance)
                VALUES (:id, :u, :e, :pwd, 'Client', 'Active', 1, :ca, :dob)
            """), {"id": uid, "u": username, "e": email, "pwd": hash_password('Seed1234!'), "ca": created_at, "dob": dob})
            return uid

        def new_abn(uid, use_offre, oid, sid, d_debut, d_fin, statut, is_active):
            aid = str(uuid.uuid4())
            if use_offre:
                montant  = offre_prix[oid]
                type_str = f"{offre_duree[oid]} mois"
                sid_v, oid_v = None, oid
            else:
                jours    = (d_fin - d_debut).days
                montant  = svc_prix[sid] * (12 if jours > 200 else 1)
                type_str = "annuel" if jours > 200 else "mensuel"
                sid_v, oid_v = sid, None
            conn.execute(text("""
                INSERT INTO Abonnements (Id, UserId, OffreId, ServiceId, Type, Montant, DateDebut, DateFin, IsActive, Statut, CreatedAt)
                VALUES (:id, :uid, :oid, :sid, :type, :m, :dd, :df, :ia, :st, :dd)
            """), {"id": aid, "uid": uid, "oid": oid_v, "sid": sid_v,
                   "type": type_str, "m": montant,
                   "dd": d_debut, "df": d_fin, "ia": is_active, "st": statut})
            return aid, montant

        def new_pay(aid, uid, montant, statut, dt):
            conn.execute(text("""
                INSERT INTO Paiements (Id, AbonnementId, UserId, Montant, Statut, CreatedAt, PaymentType)
                VALUES (:id, :aid, :uid, :m, :st, :dt, 'subscription')
            """), {"id": str(uuid.uuid4()), "aid": aid, "uid": uid, "m": montant, "st": statut, "dt": dt})

        def new_feedback(uid, aid, note, dt):
            conn.execute(text("""
                INSERT INTO Feedbacks (Id, ClientId, AbonnementId, Note, CreatedAt)
                VALUES (:id, :uid, :aid, :note, :dt)
            """), {"id": str(uuid.uuid4()), "uid": uid, "aid": aid, "note": note, "dt": dt})

        def new_demande(aid, uid, statut, dt):
            conn.execute(text("""
                INSERT INTO DemandesRenouvellement (Id, AbonnementId, ClientId, Statut, CreatedAt)
                VALUES (:id, :aid, :uid, :st, :dt)
            """), {"id": str(uuid.uuid4()), "aid": aid, "uid": uid, "st": statut, "dt": dt})

        # ── CHURNERS (900) ────────────────────────────────────────────
        print("Generation des churners...")
        churn_profiles = [
            ((18, 28), (50,  500), (2, 4), (1, 2), 0.55, 0.12),
            ((25, 55), (60,  700), (1, 3), (2, 3), 0.45, 0.20),
            ((20, 60), (45,  600), (1, 2), (1, 2), 0.75, 0.25),
            ((30, 70), (200, 900), (0, 1), (3, 5), 0.40, 0.30),
        ]

        for i in range(900):
            p = churn_profiles[i % 4]
            age = random.randint(*p[0])
            dob = rand_dob(age, age + 1)
            ancien = random.randint(*p[1])
            created_at = NOW - timedelta(days=ancien)

            uid = new_user(f"Churner{i+1}", f"churner{i+1}@seed.axia.tn", created_at, dob)

            use_offre = random.random() > 0.35
            max_mois  = max(1, (ancien - 5) // 30)
            oid = random.choice(offres_max(max_mois))
            sid = random.choice(svc_ids)
            duree_j = offre_duree[oid] * 30 if use_offre else 30

            debut_age = random.randint(duree_j + 1, max(duree_j + 2, ancien - 2))
            d_debut = NOW - timedelta(days=debut_age)
            d_fin   = d_debut + timedelta(days=duree_j)

            aid, montant = new_abn(uid, use_offre, oid, sid, d_debut, d_fin, 'Expire', 0)

            for _ in range(random.randint(*p[2])):
                new_pay(aid, uid, montant, 'failed',
                        d_debut + timedelta(days=random.randint(0, max(1, duree_j - 1))))

            if random.random() < 0.25:
                new_pay(aid, uid, montant, 'completed', d_debut)

            if random.random() < p[4]:
                new_feedback(uid, aid, random.randint(*p[3]),
                             d_fin - timedelta(days=random.randint(1, 7)))

            if random.random() < p[5]:
                new_demande(aid, uid, 'refusee',
                            d_fin - timedelta(days=random.randint(1, 3)))

            if (i + 1) % 300 == 0:
                print(f"  {i+1}/900 churners")

        print("900 churners crees")

        # ── RENEWERS (900) ────────────────────────────────────────────
        print("Generation des renewers...")
        renew_profiles = [
            ((30, 65), (100,  900), (2, 4), (4, 5), 0.78),
            ((25, 45), (80,   600), (2, 3), (3, 5), 0.65),
            ((18, 35), (50,   500), (2, 3), (2, 4), 0.55),
            ((35, 70), (150, 1200), (3, 5), (3, 5), 0.70),
        ]

        for i in range(900):
            p = renew_profiles[i % 4]
            age = random.randint(*p[0])
            dob = rand_dob(age, age + 1)
            ancien = random.randint(*p[1])
            created_at = NOW - timedelta(days=ancien)

            uid = new_user(f"Renewer{i+1}", f"renewer{i+1}@seed.axia.tn", created_at, dob)

            nb_cycles = random.randint(*p[2])
            use_offre = random.random() > 0.30
            max_mois  = max(1, (ancien - 30) // (nb_cycles * 37))
            oid = random.choice(offres_max(max_mois))
            sid = random.choice(svc_ids)
            duree_j = offre_duree[oid] * 30 if use_offre else 30

            current = created_at + timedelta(days=random.randint(1, 15))

            for c in range(nb_cycles):
                d_debut = current
                d_fin   = d_debut + timedelta(days=duree_j)
                is_last = (c == nb_cycles - 1)

                if is_last and d_fin > NOW:
                    statut, is_active = 'Actif', 1
                else:
                    statut, is_active = 'Expire', 0
                    if d_fin > NOW:
                        d_fin = NOW - timedelta(days=random.randint(1, 5))

                aid, montant = new_abn(uid, use_offre, oid, sid,
                                       d_debut, d_fin, statut, is_active)

                if c == 0 and random.random() < 0.12:
                    new_pay(aid, uid, montant, 'failed', d_debut)

                new_pay(aid, uid, montant, 'completed',
                        d_debut + timedelta(days=random.randint(0, 2)))

                if statut == 'Expire' and random.random() < p[4]:
                    new_feedback(uid, aid, random.randint(*p[3]),
                                 d_fin - timedelta(days=random.randint(5, 30)))

                if statut == 'Expire' and c < nb_cycles - 1:
                    new_demande(aid, uid, 'acceptee',
                                d_fin - timedelta(days=random.randint(3, 14)))

                current = d_fin + timedelta(days=random.randint(1, 7))

            if (i + 1) % 300 == 0:
                print(f"  {i+1}/900 renewers")

        print("900 renewers crees")

        # ── CLIENTS ACTIFS (200) ──────────────────────────────────────
        print("Generation des clients actifs...")
        for i in range(200):
            age = random.randint(18, 65)
            dob = rand_dob(age, age + 1)
            ancien = random.randint(30, 730)
            created_at = NOW - timedelta(days=ancien)

            uid = new_user(f"Actif{i+1}", f"actif{i+1}@seed.axia.tn", created_at, dob)

            use_offre = random.random() > 0.40
            max_mois  = max(1, (ancien - 5) // 30)
            oid = random.choice(offres_max(max_mois))
            sid = random.choice(svc_ids)
            duree_j = offre_duree[oid] * 30 if use_offre else 30

            jours_restants = random.randint(1, 120)
            d_fin   = NOW + timedelta(days=jours_restants)
            d_debut = d_fin - timedelta(days=duree_j)

            aid, montant = new_abn(uid, use_offre, oid, sid, d_debut, d_fin, 'Actif', 1)

            if random.random() < 0.18:
                new_pay(aid, uid, montant, 'failed', d_debut)
            new_pay(aid, uid, montant, 'completed', d_debut)

            if random.random() < 0.50:
                new_feedback(uid, aid, random.randint(2, 5),
                             d_debut + timedelta(days=random.randint(5, max(6, duree_j // 2))))

            if random.random() < 0.30:
                st_d = random.choice(['en attente', 'acceptee', 'refusee'])
                new_demande(aid, uid, st_d,
                            NOW - timedelta(days=random.randint(1, 10)))

            if (i + 1) % 50 == 0:
                print(f"  {i+1}/200 actifs")

        print("200 clients actifs crees")

        # ── RÉSUMÉ ────────────────────────────────────────────────────
        conn.commit()
        print("\n" + "=" * 45)
        print("SEED TERMINE AVEC SUCCES")
        print("=" * 45)
        print("  Responsables   :     5")
        print("  Services       :    12")
        print("  Offres         :    12")
        print("  Churners       :   900  (label=0)")
        print("  Renewers       :   900  (label=1)")
        print("  Actifs         :   200  (prediction)")
        print("  Total clients  :  2000")
        print("=" * 45)

if __name__ == "__main__":
    run_seed()