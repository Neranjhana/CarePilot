// src/PdfUploader.js
import React, { useState, useEffect } from 'react';

function PdfUploader() {
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    const loadPdfjsWorker = () => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
      document.body.appendChild(script);
      script.onload = () => {
        // Set the worker source after loading pdf.js
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
      };
    };
    
    loadPdfjsWorker();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      extractTextFromPdf(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

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

      console.log("Extracted Text:", text);
      setExtractedText(text);

      // Call the backend API with the extracted text
      sendExtractedTextToBackend(text);
    };

    reader.readAsArrayBuffer(file);
  };

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
      setResponseMessage(`Response from backend: ${data.message || "Success!"}`); // Adjust based on your backend response
    } catch (error) {
      console.error('Error sending extracted text to backend:', error);
      setResponseMessage('Failed to send extracted text to backend.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload PDF File</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <h3>Extracted Text:</h3>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        {extractedText}
      </pre>
      {responseMessage && <p>{responseMessage}</p>} {/* Display response message */}
    </div>
  );
}

export default PdfUploader;
