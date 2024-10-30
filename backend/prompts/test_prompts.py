import os
from dotenv import load_dotenv
from prompt_functions import generate_prompts, get_llm_response # Update this import based on your actual module name

# Load environment variables from .env file
load_dotenv()

def print_llm_response(prompt, response):
    """Display the response from the LLM."""
    if response.status_code == 200:
        response_data = response.json()
        print(f"LLM Response:\n", response_data['choices'][0]['message']['content'])
    else:
        print(f"Failed to get a response from the LLM", response.status_code)

def fetch_responses(prompts):
    """Get responses from the LLM for the given prompts."""
    for prompt in prompts:
        response = get_llm_response(prompt['content'])
        print_llm_response(prompt['content'], response)

def main():
    # Example health record for testing
    health_record = """
    Patient Name: John Doe
    Diagnosis: Hypertension
    Current Medications: Lisinopril
    Symptoms: Headaches, fatigue
    Upcoming Appointments: Check-up on 2024-10-15
    """

    # Generate prompts
    summary_prompt, patient_prompt, caregiver_prompt = generate_prompts(health_record)
    
    # Create a list of prompts for fetching responses
    prompts = [
        {'type': 'Summary', 'content': summary_prompt},
        {'type': 'Patient', 'content': patient_prompt},
        {'type': 'Caregiver', 'content': caregiver_prompt}
    ]

    # Fetch and display responses
    fetch_responses(prompts)

if __name__ == "__main__":
    main()