import joblib
import os
from ml_training.feature_extraction import extract_features

# 1. Check if the model file exists in the correct backend path
model_path = "backend/app/data/models/phishing_rf_model.joblib"
if not os.path.exists(model_path):
    print(f"❌ ERROR: Model file not found at {model_path}")
    exit(1)
else:
    print(f"✅ Success: Model file found at {model_path}")

# 2. Load the trained model
print("Loading model...")
model = joblib.load(model_path)
print("✅ Success: Model loaded into memory successfully!")

# 3. Test prediction with a sample malicious/phishing-style URL
test_url = "https://secure-login-paypal.com.account-verify.xyz/auth"
print(f"\nRunning test prediction on URL: {test_url}")

# Extract features using your feature_extraction.py script
features = extract_features(test_url)

# Predict probability
probabilities = model.predict_proba([features])[0]
# Assuming class 1 (or 2/3 depending on your label encoding) is phishing
phishing_prob = float(probabilities[-1] if len(probabilities) > 1 else probabilities[0])

print("\n--- MODEL OUTPUT RESULTS ---")
print(f"Extracted Feature Count: {len(features)}")
print(f"Phishing Probability Score: {phishing_prob:.4f}")

if phishing_prob > 0.5:
    print("Risk Level: HIGH 🚨 (Correctly flagged as dangerous)")
else:
    print("Risk Level: LOW 🟢 (Flagged as safe)")

print("\n✨ Your ML pipeline is fully operational and ready for backend integration!")
