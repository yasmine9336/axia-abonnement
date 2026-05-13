import joblib
import os
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import text
from app.database import get_connection
from app.recommend import preprocess

VECTORIZER_PATH = os.getenv("VECTORIZER_PATH", "models/tfidf_vectorizer.joblib")

_vectorizer_cache = None

def _get_vectorizer():
    global _vectorizer_cache
    if _vectorizer_cache is None and os.path.exists(VECTORIZER_PATH):
        _vectorizer_cache = joblib.load(VECTORIZER_PATH)
    return _vectorizer_cache

def invalidate_vectorizer_cache():
    global _vectorizer_cache
    _vectorizer_cache = None

def validate_sector(intitule: str, description: str, secteur: str) -> dict:
    vectorizer = _get_vectorizer()
    if vectorizer is None:
        return {"score": 0.0, "valid": False, "message": "Modèle non entraîné."}

    new_text = preprocess(f"{intitule} {description}")

    with get_connection() as conn:
        rows = conn.execute(text("""
            SELECT s.IntituleService + ' ' + s.Description AS texte
            FROM Services s
            JOIN Users u ON u.Id = s.ResponsableId
            WHERE u.SecteurActivite = :secteur AND s.IsActive = 1
            UNION ALL
            SELECT o.IntituleOffre + ' ' + o.Description AS texte
            FROM Offres o
            JOIN Users u ON u.Username = o.CreePar AND u.Role = 'Responsable'
            WHERE u.SecteurActivite = :secteur AND o.IsActive = 1
        """), {"secteur": secteur}).fetchall()

    if not rows:
        return {"score": 0.5, "valid": True, "message": "Premier service de ce secteur."}

    corpus = [preprocess(r[0]) for r in rows]
    corpus_vecs = vectorizer.transform(corpus)
    new_vec = vectorizer.transform([new_text])
    scores = cosine_similarity(new_vec, corpus_vecs)[0]
    score = float(scores.max())

    if score >= 0.08:
        return {"score": score, "valid": True, "message": "Contenu cohérent avec votre secteur."}
    else:
        return {"score": score, "valid": False, "message": "Ce contenu ne correspond pas à votre secteur d'activité."}