import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# API URL and headers (replace with your key)
API_URL = os.getenv('KINDO_URL')
API_KEY = os.getenv('KINDO_KEY')

headers = {
    "api-key": API_KEY,
    "content-type": "application/json"
}

def generate_prompt_chat(health_record, role, msg_hist, query):
    if msg_hist==None:
        msg_hist="Empty"
    if role=="patient":
        prompt = (
            "As a caregiver co-pilot, respond to this query from the patient. Be mindful that the response is fed directly to the patient through a chat interface."
            "Provide the response in a few lines using the health record and message history with the patient below.\n"
            f"Query: {query}\n\n"
            f"Health Record: {health_record}\n\n"
            f"Message History: {msg_hist}\n\n"
        )
    else:
        prompt = (
            "As a caregiver co-pilot, respond to this query from the patient's caregiver. Be mindful that the response is fed directly to the caregiver through a chat interface."
            "Provide the response in a few lines using the health record and message history with the caregiver below.\n"
            f"Query: {query}\n\n"
            f"Health Record: {health_record}\n\n"
            f"Message History: {msg_hist}\n\n"
        )
    return prompt



def generate_prompt_initial(health_record, type="summary"):
    """
    Generate LLM prompts from the provided health record.
    
    Args:
        health_record (str): The health record to generate prompts for.

    Returns:
        tuple: Summary, patient, and caregiver prompts.
    """
    # Summary prompt
    summary_prompt = (
        "Please read the following health record and provide a brief, friendly summary in the following format:\n"
        "'Thanks for sharing your record, it looks like [concise summary here]'.\n"
        "The summary should include:\n"
        "- The patient's name\n"
        "- Current health status in one sentence\n"
        "Keep it simple and clear.\n\n"
        f"Health Record: {health_record}\n\n"
        "Summary:"
    )

    # Patient overview prompt
    patient_prompt = (
        "Provide a friendly overview of the health record for the patient, including:\n"
        "- Diagnosis summary\n"
        "- Upcoming appointments\n"
        "- Medicines\n"
        "- Symptoms\n\n"
        "Please write in the first person, as if speaking directly to the patient.\n\n"
        f"Health Record: {health_record}\n\n"
        "Patient Overview:"
    )

    # Caregiver overview prompt
    caregiver_prompt = (
        "Provide a detailed overview of the health record for the caregiver, including:\n"
        "- Diagnosis summary\n"
        "- Upcoming appointments\n"
        "- Medicines\n"
        "- Symptoms\n"
        "- Caregiving tips\n\n"
        "Please write in the second person, as if advising the caregiver.\n\n"
        f"Health Record: {health_record}\n\n"
        "Caregiver Overview:"
    )
    actionplan_prompt = (
            "Provide a concise and succint list of the top 3 to 5 things the caregiver should do for the patient based ONLY on the information in the health record. Do NOT add any information that is not explicitly mentioned in the health record. Include:\n"
            "- Priority care tasks\n"
            "- Daily routines or habits to establish\n"
            "- Any necessary lifestyle changes or activities to support recovery\n"
            "- Be consice and crisp, each should be one sentence, no need for topics, just direct one sentence action \n"
            "- Key reminders for the caregiver's role in the patient's health\n\n"
            "- Give it as a list of consise action items\n\n"
            "- Use the chat details about the patient\n\n"
            "- If there is anything alarming, inform it\n\n"
            "Make the advice actionable, clear, and easy to follow without assuming or fabricating details.\n\n"
            f"Health Record: {health_record}\n\n"
            "Caregiver Action Plan (based strictly on provided health record):"
        )
    prompts = {"summary": summary_prompt, 
               "patient": patient_prompt, 
               "caregiver": caregiver_prompt,
                "actionplan": actionplan_prompt}
    return prompts[type]

def get_llm_response(prompt, model="groq/llama-3.1-70b-versatile"):
    """
    Get a response from the LLM for the provided prompt.

    Args:
        prompt (str): The prompt to send to the LLM.

    Returns:
        Response object: The response from the LLM.
    """
    # Create JSON payload and send POST request
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}]
    }
    response = requests.post(API_URL, headers=headers, data=json.dumps(payload))

    return response.json()