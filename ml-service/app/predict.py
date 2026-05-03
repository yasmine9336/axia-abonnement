import joblib
import pandas as pd
from app.data_preparation import load_prediction_data

def predict():
    bundle   = joblib.load("models/churn_model.joblib")
    model    = bundle["model"]
    scaler   = bundle["scaler"]
    features = bundle["features"]
    name     = bundle["name"]

    print(f"Modele charge : {name}")

    df = load_prediction_data()

    if df.empty:
        print("Aucun client actif trouve.")
        return pd.DataFrame()

    X = df[features]

    if scaler is not None:
        probas = model.predict_proba(scaler.transform(X))[:, 1]
    else:
        probas = model.predict_proba(X)[:, 1]

    df["churn_probability"] = probas

    df["risk_level"] = df.apply(lambda row: (
        "eleve"  if row["churn_probability"] > 0.6 else
        "moyen"  if row["churn_probability"] > 0.35 else
        "faible"
    ), axis=1)

    df_sorted = df[["user_id", "abn_id", "jours_avant_expiration",
                    "churn_probability", "risk_level"]].sort_values(
        "churn_probability", ascending=False
    )

    return df_sorted


if __name__ == "__main__":
    df = predict()
    print(df.to_string(index=False))