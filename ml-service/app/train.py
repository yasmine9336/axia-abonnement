import os
import joblib
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
    "type_abonnement",
    "note_moyenne",
    "a_feedback",
    "nb_paiements_echoues",
    "montant_total_paye",
]

def train():
    print("Chargement des donnees...")
    df = load_training_data()

    X = df[FEATURES]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    print(f"Donnees : {len(df)} exemples")
    print(f"Entrainement : {len(X_train)} | Test : {len(X_test)}")
    print("-" * 50)

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest":       RandomForestClassifier(n_estimators=100, random_state=42),
        "XGBoost":             XGBClassifier(n_estimators=100, random_state=42, eval_metric="logloss"),
    }

    results = {}
    print("Resultats des modeles :")
    print("-" * 50)

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
            "model":  model,
            "scaler": scaler if name == "Logistic Regression" else None,
            "acc":    acc,
            "f1":     f1,
            "auc":    auc,
        }

        print(f"{name:<25} Accuracy: {acc:.2f}  F1: {f1:.2f}  AUC: {auc:.2f}")

    print("-" * 50)

    best_name = max(results, key=lambda k: results[k]["auc"])
    best = results[best_name]

    print(f"Meilleur modele : {best_name}")
    print(f"Accuracy: {best['acc']:.2f}  F1: {best['f1']:.2f}  AUC: {best['auc']:.2f}")

    os.makedirs("models", exist_ok=True)
    joblib.dump({
        "model":    best["model"],
        "scaler":   best["scaler"],
        "features": FEATURES,
        "name":     best_name,
    }, "models/churn_model.joblib")

    print(f"Modele '{best_name}' sauvegarde dans models/churn_model.joblib")


if __name__ == "__main__":
    train()