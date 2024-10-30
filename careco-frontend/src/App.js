// import React from 'react';
// import logo from './logo.svg'; // Keep this if you're using the logo
// import './App.css';
// import SubmitForm from './components/patientform'; // Import PatientForm.js


// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Care Vibes</h1>
//         {/* Render the PatientForm component */}
//         <SubmitForm />
        
//       </header>
//     </div>
//   );
// }

// export default App;

// src/App.js
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import SubmitForm from './components/patientform'; // Import your existing SubmitForm component
import Caregiver from './components/caregiver'; // Import the new Caregiver component

function App() {
  return (
    <Router>
      <div className="App">
      <header
					style={{
						textAlign: "left",
						marginLeft: "25px",
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					<h1 style={{ marginBottom: 0 }}>Care Pilot</h1>
					<div style={{ marginTop: "12px", marginRight: "12px" }}>
						<img
							src='https://media.licdn.com/dms/image/C5603AQGrMR4H4r-3Fw/profile-displayphoto-shrink_200_200/0/1599514662622?e=2147483647&v=beta&t=_yx7YSUDIGMbyLoUgxy8XTNUa3r_aoXB8slk65GIKPA' // You can replace this with a real profile image URL
							alt='User Profile'
							width={48}
							height={48}
							style={{ borderRadius: "24px" }} // borderRadius half of wdith/height for circular effect
						/>
					</div>
				</header>
          {/* Navigation links */}
          {/* <nav>
            <Link to="/" style={{ margin: '10px' }}>Home</Link>
            <Link to="/caregiver" style={{ margin: '10px' }}>Caregiver</Link>
          </nav> */}
          {/* Define routes */}
          <Routes>
            <Route path="/" element={<SubmitForm />} />
            <Route path="/caregiver" element={<Caregiver />} />
          </Routes>
        
      </div>
    </Router>
  );
}

export default App;
