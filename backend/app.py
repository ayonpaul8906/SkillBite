from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials, firestore, db
# import google.generativeai as genai

from groq import generate_learning_resources

load_dotenv()

app = Flask(__name__)
CORS(app)

cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()



##<-----Main route------>
@app.route("/", methods = ["GET"])
def home():
    return jsonify({"message":"SkillBite is running"})



##<-----/recommend → POST user inputs → Gemini call → structured list of resources------>
@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    user_id = data.get("userId")
    skills = data.get("skills", "")
    goal = data.get("goal", "")

    if not user_id or not skills or not goal:
        return jsonify({"error": "Missing userId, skills, or goal"}), 400

    recommendations_raw = generate_learning_resources(skills, goal)

    try:
        import json
        recommendations = json.loads(recommendations_raw)
    except Exception as e:
        return jsonify({"error": "Failed to parse Gemini response", "raw": recommendations_raw, "exception": str(e)}), 500

    try:
        user_ref = db.collection("users").document(user_id)
        user_ref.set({
            "skills": skills,
            "goal": goal,
            "recommendations": recommendations,
        }, merge=True)

        print("✅ Firestore write successful for user:", user_id)
    except Exception as e:
        print("❌ Firestore write failed:", e)
        return jsonify({"error": "Firestore write failed", "exception": str(e)}), 500

    return jsonify(recommendations)



##<--------/progress → GET user_id → fetch Firestore recommendations------>
@app.route('/progress', methods=['GET'])
def get_progress():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    try:
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404

        data = doc.to_dict()
        return jsonify({"progress": data.get('recommendations', [])})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



##<--------/progress/update → POST user_id, resource_index, completed → update Firestore------>
@app.route('/progress/update', methods=['POST'])
def update_progress():
    data = request.get_json()
    user_id = data.get('user_id')
    resource_index = data.get('resource_index')
    completed = data.get('completed', True)

    # Validate required fields
    if not user_id or resource_index is None:
        return jsonify({"error": "Missing fields"}), 400

    try:
        # Fetch document
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404

        doc_data = doc.to_dict()

        # Access recommendations → resources list
        recommendations = doc_data.get("recommendations", {})
        resources = recommendations.get("resources", [])

        if resource_index < 0 or resource_index >= len(resources):
            return jsonify({"error": "Invalid resource_index"}), 400

        # Add/update 'completed' field in resource
        resources[resource_index]['completed'] = completed

        # Save back the updated recommendations
        recommendations['resources'] = resources
        doc_ref.update({'recommendations': recommendations})

        return jsonify({"message": "Progress updated successfully."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    app.run(debug=True, port=8000)