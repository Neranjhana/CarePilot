import React, { useState, useEffect } from 'react';

function Caregiver() {
  // State to hold the input value, chat messages, and action plan
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]); // Store messages here
  const [responseMessage, setResponseMessage] = useState('');
  const [actionPlan, setActionPlan] = useState({}); // Store action plan here

  // Fetch action plan from backend on component mount
  useEffect(() => {
    // Fetch the action plan from the backend
    fetch('http://localhost:5000/actionplan')  // Adjust the API endpoint as needed
      .then((response) => response.json())
      .then((data) => {
        setActionPlan(data.action_plan);  // Store the action plan in the state
      })
      .catch((error) => {
        console.error('Error fetching action plan:', error);
      });
  }, []);

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    const data = { input_text: inputText, role: "caregiver" };

    // Update messages with user input
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputText, type: 'user' },
    ]);

    // Make the API call
    fetch('http://localhost:5000/testchat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        // Update messages with the response
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: result.modified_text, type: 'bot' },
        ]);
        setInputText(''); // Clear the input
      })
      .catch((error) => {
        console.error('Error:', error);
        setResponseMessage('An error occurred.');
      });
  };

  return (
    <div className="caregiver-container" style={styles.container}>
      {/* Left Side: Action Plan Checklist */}
      <div style={styles.actionPlanContainer}>
        <h3>Action Plan Checklist</h3>
        {Object.entries(actionPlan).map(([key, value]) => (
          <div key={key} style={styles.checklistItem}>
            <input type="checkbox" id={`action-${key}`} />
            <label htmlFor={`action-${key}`} style={styles.checklistLabel}>
              {value}
            </label>
          </div>
        ))}
      </div>

      {/* Right Side: Chat */}
      <div className="caregiver-form" style={styles.chatFormContainer}>
        <div style={styles.chatContainer}>
          {/* Display messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(message.type === 'user' ? styles.userMessage : styles.botMessage),
              }}
            >
              {message.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Hi there, how can I help you, help your loved one today?"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Submit
          </button>
        </form>
        {responseMessage && <p>{responseMessage}</p>}
      </div>
    </div>
  );
}

const styles = {
    container: {
      width: '90%',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '40px', // Increase gap for breathing space
      padding: '20px',
      flexWrap: 'wrap', // Ensure the layout adjusts on smaller screens
    },
    actionPlanContainer: {
      width: '90%', // Take up more space for better readability
      padding: '30px', // Increase padding
      backgroundColor: '#f0f4f8', // Softer background color
      borderRadius: '12px', // Rounded corners for better visual appeal
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
      maxHeight: '600px',
      overflowY: 'auto',
      marginBottom: '20px', // Add space between the action plan and bottom of container
    },
    checklistItem: {
      display: 'flex',
      alignItems: 'flex-start', // Align checkbox with the start of text
      marginBottom: '15px', // Increase margin between items
    },
    checklistLabel: {
      marginLeft: '10px',
      fontSize: '14px', // Keep font small but readable
      color: '#333',
      lineHeight: '1.5', // Better line spacing for readability
    },
    chatFormContainer: {
      width: '55%', // Give the chat section slightly more width
      padding: '30px', // Consistent padding
      backgroundColor: '#fff', // Clean white background
      borderRadius: '12px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', // Same shadow as action plan
    },
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      maxHeight: '400px',
      overflowY: 'auto',
      marginBottom: '20px',
      padding: '10px',
      borderRadius: '8px',
    //   border: '1px solid #ccc',
    //   backgroundColor: '#f9f9f9',
    },
    message: {
      padding: '10px',
      borderRadius: '4px',
      margin: '5px 0',
      maxWidth: '70%',
    },
    userMessage: {
    //   backgroundColor: '#d1e7dd',
      alignSelf: 'flex-end',
      textalign: 'right',
    },
    botMessage: {
    //   backgroundColor: '#f8d7da',
      alignSelf: 'flex-start',
      textalign: 'left',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
    //   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '16px', // Slightly larger font for the input
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
    },
  };
  

export default Caregiver;