from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

# Load trained model
model = joblib.load("traffic_model.pkl")

# Convert prediction number to text
def get_congestion_level(value):
    if value == 0:
        return "Low"
    elif value == 1:
        return "Medium"
    else:
        return "High"


@app.route("/")
def home():
    return jsonify({
        "message": "Traffic ML Prediction Server is running"
    })


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    vehicle_count = data.get("vehicle_count")
    average_speed = data.get("average_speed")
    road_capacity = data.get("road_capacity")
    time_of_day = data.get("time_of_day")
    weather = data.get("weather")
    accident = data.get("accident")

    # Validate input
    if None in [
        vehicle_count,
        average_speed,
        road_capacity,
        time_of_day,
        weather,
        accident
    ]:
        return jsonify({
            "error": "All fields are required"
        }), 400

    # Prepare input
    features = [[
        vehicle_count,
        average_speed,
        road_capacity,
        time_of_day,
        weather,
        accident
    ]]

    # Prediction
    prediction = model.predict(features)[0]

    # Probability
    probabilities = model.predict_proba(features)[0]
    confidence = max(probabilities) * 100

    congestion = get_congestion_level(prediction)

    return jsonify({
        "congestionLevel": congestion,
        "prediction": int(prediction),
        "confidence": round(confidence, 2)
    })


if __name__ == "__main__":
    print("Starting Traffic ML Server...")
    print("Server running at http://127.0.0.1:5005")

    app.run(
        host="127.0.0.1",
        port=5005,
        debug=True
    )