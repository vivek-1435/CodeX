from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# Securely store API Key in environment variables
API_KEY = os.getenv("OPENROUTER_API_KEY")

if not API_KEY:
    raise ValueError("🚨 Missing API Key! Set OPENROUTER_API_KEY in your environment variables.")

# OpenRouter API endpoint
API_URL = "https://api.lepton.ai/v1/chat/completions"
# Common headers
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

@app.route("/")
def home():
    return "✅ Flask server is running! Use /chat to interact."

@app.route("/chat", methods=["POST"])
def chat_with_ai():
    """Handles AI chatbot interaction"""
    try:
        data = request.json
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"error": "❌ Message is required"}), 400

        # Prepare API request payload
        request_data = {
            "model": "google/gemma-3-27b-it:free",  # Ensure this model is valid
            "messages": [{"role": "user", "content": user_message}]
        }

        response = requests.post(API_URL, headers=HEADERS, json=request_data)
        result = response.json()

        # ✅ Improved Error Handling
        if "choices" in result and len(result["choices"]) > 0:
            return jsonify({"reply": result["choices"][0]["message"]["content"]})
        else:
            return jsonify({"error": "❌ Invalid response from API", "details": result}), 500

    except requests.exceptions.RequestException as req_err:
        return jsonify({"error": "❌ API request failed", "details": str(req_err)}), 500
    except Exception as e:
        return jsonify({"error": "❌ An unexpected error occurred", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True) 

