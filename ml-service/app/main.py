import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from app.data_preparation import load_training_data, load_prediction_data
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.preprocessing import StandardScaler

app = FastAPI(title="AxiaAbonnement ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FEATURES = [
    "age", "anciennete", "nb_abonnements_total",
    "nb_par_service", "nb_par_offre", "jours_avant_expiration",
    "type_abonnement", "note_moyenne", "a_feedback",
    "nb_paiements_echoues", "nb_renouvellements_acceptes",
    "nb_renouvellements_refuses", "montant_total_paye",
]

MODEL_PATH = os.getenv("MODEL_PATH", "models/churn_model.joblib")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "axia-ml-secret-2025")

def verify_key(x_api_key: str = Header(...)):
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Clé API invalide.")

@app.get("/health")
def health():
    model_exists = os.path.exists(MODEL_PATH)
    return {
        "status": "ok",
        "model_loaded": model_exists,
    }

@app.post("/train")
def train(x_api_key: str = Header(...)):
    verify_key(x_api_key)

    try:
        df = load_training_data()

        X = df[FEATURES]
        y = df["label"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled  = scaler.transform(X_test)

        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
            "Random Forest":       RandomForestClassifier(n_estimators=100, random_state=42),
            "XGBoost":             XGBClassifier(n_estimators=100, random_state=42, eval_metric="logloss"),
        }

        results = {}
        for name, model in models.items():
            if name == "Logistic Regression":
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                y_prob = model.predict_proba(X_test_scaled)[:, 1]
                use_scaler = scaler
            else:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                y_prob = model.predict_proba(X_test)[:, 1]
                use_scaler = None

            results[name] = {
                "model":    model,
                "scaler":   use_scaler,
                "accuracy": round(accuracy_score(y_test, y_pred), 4),
                "f1":       round(f1_score(y_test, y_pred), 4),
                "auc":      round(roc_auc_score(y_test, y_prob), 4),
            }

        # Choisir automatiquement le meilleur (AUC)
        best_name = max(results, key=lambda k: results[k]["auc"])
        best = results[best_name]

        os.makedirs("models", exist_ok=True)
        joblib.dump({
            "model":    best["model"],
            "scaler":   best["scaler"],
            "features": FEATURES,
            "name":     best_name,
        }, MODEL_PATH)

        return {
            "status": "success",
            "best_model": best_name,
            "metrics": {
                "accuracy": best["accuracy"],
                "f1":       best["f1"],
                "auc":      best["auc"],
            },
            "all_models": {
                name: {
                    "accuracy": r["accuracy"],
                    "f1":       r["f1"],
                    "auc":      r["auc"],
                }
                for name, r in results.items()
            },
            "training_samples": len(df),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/predict")
def predict(x_api_key: str = Header(...)):
    verify_key(x_api_key)

    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=404, detail="Modèle non trouvé. Lance /train d'abord.")

    try:
        bundle  = joblib.load(MODEL_PATH)
        model   = bundle["model"]
        scaler  = bundle["scaler"]
        features = bundle["features"]

        df = load_prediction_data()

        if df.empty:
            return {"status": "ok", "predictions": [], "total": 0}

        X = df[features]

        if scaler is not None:
            probas = model.predict_proba(scaler.transform(X))[:, 1]
        else:
            probas = model.predict_proba(X)[:, 1]

        df["churn_probability"] = probas
        df["risk_level"] = df.apply(lambda row: (
            "high"   if row["jours_avant_expiration"] < 30  and row["churn_probability"] > 0.5 else
            "medium" if row["jours_avant_expiration"] <= 60 and row["churn_probability"] > 0.3 else
            "low"
        ), axis=1)

        predictions = df[[
            "user_id", "abn_id", "jours_avant_expiration",
            "churn_probability", "risk_level"
        ]].sort_values("churn_probability", ascending=False).to_dict(orient="records")

        return {
            "status": "ok",
            "model_used": bundle["name"],
            "total": len(predictions),
            "predictions": predictions,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))