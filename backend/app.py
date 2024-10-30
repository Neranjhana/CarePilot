
import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
from pymongo import MongoClient
from dotenv import load_dotenv
from prompts.prompt_functions import *
import datetime
from prompts.parse_prompts import *
import re


# Initialize the Flask app
app = Flask(__name__)
CORS(app)
load_dotenv()
sample_hr_dir = 'src/sampleHR.json'
patient_ID = 1
llm_model = "azure/gpt-4o"

# MongoDB Atlas connection string from .env
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['PatientRecord']
collection_hr = db['HealthRecord']  # Collection to store health records
msg_history = {"patient": db['PatientMessageHistory'], "caregiver": db['CaregiverMessageHistory']}

# Define the route for the home page
@app.route('/')
def home():
    return "Welcome to my Flask app!"


@app.route('/EMRUpload', methods=['POST'])
def submit_health_record():
    try:
        # Get the health record from the request
        health_record = (request.json.get('input_text'))
        # with open(sample_hr_dir) as f:
        #     health_record = json.load(f)

        # Save the health record to MongoDB
        # collection_hr.insert_one(health_record)
        entry = {"id":patient_ID, "health_record":health_record}
        filter_criteria = {"id": patient_ID} 
        update_data = {
            "$set": {"health_record":health_record}
        }
        result = collection_hr.update_one(filter_criteria, update_data, upsert=True)

        # Forward the health record to the external API
        prompt = generate_prompt_initial(entry["health_record"], "summary")
        api_response = get_llm_response(prompt, llm_model)
        
        # Return the API response to the React frontend
        return jsonify({"message": "Debugging API call and save to Mongo", "modified_text": api_response['choices'][0]['message']['content']}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/testchat', methods=['POST'])
def chat():
    ### Save msgs, fetch msgs, hr, query
    try:
        # Get the health record from the request
        filter_criteria = {"id": patient_ID} 
        health_record = collection_hr.find_one(filter_criteria)
        query = request.json.get('input_text')
        role = request.json.get('role')
        msg_hist = msg_history[role].find_one(filter_criteria)
        prompt = generate_prompt_chat(health_record, role, msg_hist, query)
        api_response = get_llm_response(prompt, llm_model)
        response = api_response['choices'][0]['message']['content']

        message=f"Timestamp: {datetime.datetime.now()}, User: {query}, Assistant: {response};"
        msg_json = {"id":patient_ID, "messages": message}
        if msg_hist != None:
            msg_json["messages"] = msg_history[role].find_one(filter_criteria)["messages"] + msg_json["messages"]
        update_data = {
            "$set": msg_json
        }
        result = msg_history[role].update_one(filter_criteria, update_data, upsert=True)

        # Return the API response to the React frontend
        return jsonify({"message": "General chat endpoint, msg history", "modified_text": response}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/actionplan', methods=['GET'])
def action_plan_creation():
    try:
        # Fetch the most recent health record from MongoDB
        filter_criteria = {"id": patient_ID} 
        health_record = collection_hr.find_one(filter_criteria)
        print("FOUND")
        if not health_record:
            return jsonify({"No health record found"}), 200
        
        # Serialize the health record to make it JSON serializable
        serialized_record = serialize_document(health_record)
        prompt = generate_prompt_initial(str(serialized_record), "actionplan")
        api_response = get_llm_response(prompt,"azure/gpt-4o")
        # print(api_response)
        llm_content = api_response['choices'][0]['message']['content']
        action_items = parse_action_plan(llm_content)
        structured_response = {
            "action_plan": action_items
        }

        print ("structured_response", structured_response)
        return jsonify(structured_response), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        # Return error as JSON if any exception occurs
        return jsonify({"error": str(e)}), 500
# Start the app
if __name__ == '__main__':
    app.run(debug=True)
