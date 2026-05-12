import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from app.train import train
from app.predict import predict as run_predictions
from app.recommend import refit_vectorizer, get_recommendations

app = FastAPI(title="AxiaAbonnement ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.getenv("MODEL_PATH", "models/churn_model.joblib")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "axia-ml-secret-2025")


def verify_key(x_api_key: str):
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Clé API invalide.")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": os.path.exists(MODEL_PATH),
    }


@app.post("/train")
def retrain(x_api_key: str = Header(...)):
    verify_key(x_api_key)
    try:
        metrics = train()
        return {"status": "success", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/predict")
def predict(x_api_key: str = Header(...)):
    verify_key(x_api_key)
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=404, detail="Modele non trouve. Lancez /train d'abord.")
    try:
        df = run_predictions()
        results = df.to_dict(orient="records")
        return {"status": "success", "total": len(results), "predictions": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train-recommend")
def train_recommend(x_api_key: str = Header(...)):
    verify_key(x_api_key)
    try:
        refit_vectorizer()
        return {"status": "success", "message": "Vectorizer TF-IDF refit avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommend/{user_id}")
def recommend(user_id: str, top_n: int = 3, x_api_key: str = Header(...)):
    verify_key(x_api_key)
    try:
        results = get_recommendations(user_id, top_n)
        return {"status": "success", "total": len(results), "recommendations": results}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))