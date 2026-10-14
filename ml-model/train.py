import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load dataset
data = pd.read_csv("traffic_data.csv")

# Features
X = data[
    [
        "vehicle_count",
        "average_speed",
        "road_capacity",
        "time_of_day",
        "weather",
        "accident"
    ]
]

# Target
y = data["congestion"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Create Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train model
model.fit(X_train, y_train)

# Test model
prediction = model.predict(X_test)

accuracy = accuracy_score(y_test, prediction)

print("Model trained successfully!")
print("Accuracy:", accuracy)

# Save model
joblib.dump(model, "traffic_model.pkl")

print("Model saved as traffic_model.pkl")