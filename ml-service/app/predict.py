import joblib
import pandas as pd
from app.data_preparation import load_prediction_data

def predict():
    print("📦 Chargement du modèle...")
    bundle  = joblib.load("models/churn_model.joblib")
    model   = bundle["model"]
    scaler  = bundle["scaler"]
    features = bundle["features"]
    name    = bundle["name"]

    print(f"✅ Modèle chargé : {name}")

    print("\n📦 Chargement des clients actifs...")
    df = load_prediction_data()

    if df.empty:
        print("❌ Aucun client actif trouvé.")
        return

    X = df[features]

    if scaler is not None:
        X_scaled = scaler.transform(X)
        probas = model.predict_proba(X_scaled)[:, 1]
    else:
        probas = model.predict_proba(X)[:, 1]

    df["churn_probability"] = probas
    df["risk_level"] = df.apply(lambda row: (
        "🔴 Élevé"  if row["jours_avant_expiration"] < 30  and row["churn_probability"] > 0.5 else
        "🟡 Moyen"  if row["jours_avant_expiration"] <= 60 and row["churn_probability"] > 0.3 else
        "🟢 Faible"
    ), axis=1)

    df_sorted = df[["user_id", "abn_id", "jours_avant_expiration",
                     "churn_probability", "risk_level"]].sort_values(
        "churn_probability", ascending=False
    )

    print("\n📊 Prédictions churn — Clients actifs :")
    print("-" * 75)
    print(f"{'User ID':<38} {'Expire dans':>12} {'Proba churn':>12} {'Risque'}")
    print("-" * 75)

    for _, row in df_sorted.iterrows():
        print(f"{row['user_id']:<38} {int(row['jours_avant_expiration']):>10}j "
              f"{row['churn_probability']:>11.2%}  {row['risk_level']}")

    print("-" * 75)
    print(f"\nTotal : {len(df)} clients analysés")
    print(f"  🔴 Risque élevé  : {(df_sorted['risk_level'] == '🔴 Élevé').sum()}")
    print(f"  🟡 Risque moyen  : {(df_sorted['risk_level'] == '🟡 Moyen').sum()}")
    print(f"  🟢 Risque faible : {(df_sorted['risk_level'] == '🟢 Faible').sum()}")

if __name__ == "__main__":
    predict()