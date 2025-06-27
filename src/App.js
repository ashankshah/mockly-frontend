/**
 * @author: David Chung
 * 
 * Creation Date: 6/22/2025
 * 
 * Creates FastAPI app
 * Adds CORS middleware (so frontend at port 3000 can talk to backend 8000)
 * 
 * Defines:
 * POST /score-session: accepts metrics + transcript JSON, runs score_session, returns result
 * 
 */


 import React from 'react';
 import InterviewSession from './components/InterviewSession';
 import FeedbackReport from './components/FeedbackReport';
 import './theme.css';
 
 function App() {
   const [report, setReport] = React.useState(null);
   const [interviewStarted, setInterviewStarted] = React.useState(false);
 
   return (
     <div className={`mockly-container ${interviewStarted ? 'expanded' : ''}`}>
      <div className={`mockly-card ${!interviewStarted && !report ? 'mockly-card--small' : 'mockly-card--large'}`}>
         {!report ? (
           <>
             <h1 className="mockly-title">Mockly AI Interview</h1>
             <InterviewSession onComplete={setReport} onStart={() => setInterviewStarted(true)} />
           </>
         ) : (
           <>
             <h1 className="mockly-title">Your Interview Feedback</h1>
             <FeedbackReport report={report} />
           </>
         )}
       </div>
     </div>
   );
 }
 
 export default App;
 