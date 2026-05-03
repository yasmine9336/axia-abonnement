import joblib
import os
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.preprocessing import StandardScaler
from app.data_preparation import load_training_data

FEATURES = [
    "age",
    "anciennete",
    "nb_abonnements_total",
    "nb_par_service",
    "nb_par_offre",
    "jours_avant_expiration",
    "type_abonnement",
    "note_moyenne",
    "a_feedback",
    "nb_paiements_echoues",
    "nb_renouvellements_acceptes",
    "nb_renouvellements_refuses",
    "montant_total_paye",
]

def train():
    print("📦 Chargement des données...")
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
    print("\n📊 Résultats des modèles :")
    print("-" * 55)

    for name, model in models.items():
        if name == "Logistic Regression":
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
            y_prob = model.predict_proba(X_test_scaled)[:, 1]
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        f1  = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)

        results[name] = {
            "model":   model,
            "scaler":  scaler if name == "Logistic Regression" else None,
            "accuracy": acc,
            "f1":       f1,
            "auc":      auc,
        }

        print(f"{name:<25} Accuracy: {acc:.2f}  F1: {f1:.2f}  AUC: {auc:.2f}")

    print("-" * 55)
    print("\n👉 Choisis le modèle à sauvegarder :")
    for i, name in enumerate(results.keys()):
        print(f"  {i+1}. {name}")

    choice = input("\nTon choix (1/2/3) : ").strip()
    chosen_name = list(results.keys())[int(choice) - 1]
    chosen = results[chosen_name]

    os.makedirs("models", exist_ok=True)
    joblib.dump({
        "model":    chosen["model"],
        "scaler":   chosen["scaler"],
        "features": FEATURES,
        "name":     chosen_name,
    }, "models/churn_model.joblib")

    print(f"\n✅ Modèle '{chosen_name}' sauvegardé dans models/churn_model.joblib")
    print(f"   Accuracy: {chosen['accuracy']:.2f} | F1: {chosen['f1']:.2f} | AUC: {chosen['auc']:.2f}")

if __name__ == "__main__":
    train()