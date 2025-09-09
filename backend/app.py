from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json

import firebase_admin
from firebase_admin import credentials, firestore, db
# import google.generativeai as genai

from groq import generate_learning_resources

load_dotenv()

app = Flask(__name__)
CORS(app)

cred_path_or_json = os.getenv("FIREBASE_CREDENTIALS_PATH")

if cred_path_or_json and cred_path_or_json.strip().startswith("{"):
    # If it looks like JSON → parse it
    cred_dict = json.loads(cred_path_or_json)
    cred = credentials.Certificate(cred_dict)
else:
    # Otherwise, assume it's a file path
    cred = credentials.Certificate(cred_path_or_json)

firebase_admin.initialize_app(cred)

db = firestore.client()



##<-----Main route------>

@app.route("/", methods = ["GET"])
def home():
    return jsonify({"message":"SkillBite is running"})



##<-----/recommend → POST user inputs → call groq → structured list of resources------>

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    user_id = data.get("userId")
    skills = data.get("skills", "")
    goal = data.get("goal", "")

    if not user_id or not skills or not goal:
        return jsonify({"error": "Missing userId, skills, or goal"}), 400

    user_ref = db.collection("users").document(user_id)
    courses_ref = user_ref.collection("courses")

    # Check active courses (not fully completed)
    active_courses = []
    courses_docs = courses_ref.stream()
    for doc in courses_docs:
        course_data = doc.to_dict()
        resources = course_data.get("resources", [])
        if not all(r.get("completed", False) for r in resources):
            active_courses.append(doc.id)

    if len(active_courses) >= 3:
        return jsonify({"error": "You can only have 3 active courses. Complete them before generating new ones.", "active_courses": active_courses}), 400

    # Generate new course
    recommendations_raw = generate_learning_resources(skills, goal)
    try:
        import json
        recommendations = json.loads(recommendations_raw)
        if "error" in recommendations:
            return jsonify(recommendations), 500
    except Exception as e:
        return jsonify({"error": "Failed to parse Groq response", "raw": recommendations_raw, "exception": str(e)}), 500

    # Use course name as document ID (sanitize for Firestore)
    course_name = recommendations.get("course_name") or goal or "untitled_course"
    course_id = course_name.replace(" ", "_").replace("/", "_").lower()

    try:
        # Store new course under courses subcollection
        courses_ref.document(course_id).set({
            "course_name": course_name,
            "goal": goal,
            "skills": skills,
            "resources": recommendations.get("resources", []),
            "created_at": firestore.SERVER_TIMESTAMP,
            "completed": False
        }, merge=True)

        # Optionally update user profile with last generated course
        user_ref.set({
            "last_generated_course": course_name,
        }, merge=True)

        print("✅ Firestore write successful for user:", user_id, "course:", course_name)
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