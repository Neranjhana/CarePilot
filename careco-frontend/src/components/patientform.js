import React, { useState, useEffect } from 'react';

function PatientForm() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]); // Store chat messages
  const [responseMessage, setResponseMessage] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  useEffect(() => {
    const loadPdfjsWorker = () => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
      document.body.appendChild(script);
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
      };
    };
    loadPdfjsWorker();
  }, []);

  // Function to handle chat submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    const data = { input_text: inputText, role: "patient" };

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

  // Function to handle PDF file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      extractTextFromPdf(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Function to extract text from the uploaded PDF
  const extractTextFromPdf = (file) => {
    const reader = new FileReader();

    reader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
      const numPages = pdf.numPages;
      let text = '';

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        text += `Page ${pageNum}: ${pageText}\n\n`;
      }

    //   console.log("Extracted Text:", text);
    //   setExtractedText(text);

      // Update messages with extracted text
    //   setMessages((prevMessages) => [
    //     ...prevMessages,
    //     { text: "Extracted from PDF: \n" + text, type: 'bot' },
    //   ]);

      // Call the backend API with the extracted text
      sendExtractedTextToBackend(text);
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to send extracted text to the backend
  const sendExtractedTextToBackend = async (text) => {
    try {
      const response = await fetch('http://localhost:5000/EMRUpload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input_text: text }), // Send extracted text as JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      setExtractedText(data.modified_text);

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.modified_text, type: 'bot' },
      ]);

    //   setResponseMessage(`Response from backend: ${data.message || "Success!"}`);
    } catch (error) {
      console.error('Error sending extracted text to backend:', error);
    //   setResponseMessage('Failed to send extracted text to backend.');
    }
  };

  return (
    <div className="submit-form">
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
          placeholder="Hi there, what can I help with today?"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Submit
        </button>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
      </form>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
}

// Inline styles
const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Align messages to the start
    maxHeight: '400px', // Limit height for scrolling
    overflowY: 'auto', // Enable vertical scrolling
    marginBottom: '20px', // Space between messages and form
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9', // Added background color for clarity
  },
  message: {
    padding: '10px',
    borderRadius: '4px',
    margin: '5px 0', // Margin between messages
    maxWidth: '70%', // Prevent messages from being too wide
    wordBreak: "break-word",
  },
  userMessage: {
    backgroundColor: "#DCF8C6", // WhatsApp green for user
    alignSelf: 'flex-end', // Align user messages to the right
    textAlign: 'right',
  },
  botMessage: {
    backgroundColor: "#ECECEC", // Lighter gray for bot
    alignSelf: 'flex-start', // Align bot messages to the left
    textAlign: 'left',
  },
  form: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  fileInput: {
    marginTop: '10px',
  },
};

export default PatientForm;
