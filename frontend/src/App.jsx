
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homepage from "./pages/Homepage";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewStage from "./pages/InterviewStage";
import ScoreBoard from "./pages/ScoreBoard";
import ScoreDetails from "./pages/ScoreDetails";
import SubjectWiseInterviewRoom from "./pages/SubjectWiseInterviewRoom";

import ProtectedRoute from "./ProtectedRoute";
import Profile from "./pages/Profile";
import UpdateGetProfile  from "./pages/UpdateGetProfile"

import RecruiterRegister from "./pages/Recruiter/RecruterRegister";
import RecruiterLogin from "./pages/Recruiter/RecruiterLogin";
import CreateJob from "./pages/CreateJob";
import RecruiterDashboard from "./pages/Recruiter/RecruiterDashboard";
import RecruiterHomepage from "./pages/Recruiter/RecruiterHomepage";
import RecruiterManageJobs from "./pages/Recruiter/RecruiterManageJobs";
import RecruiterGetAllJobs from"./pages/Recruiter/RecruiterGetAllJobs";

import RecruiterLayout from "./pages/Recruiter/RecruiterLayout"
import RecruiterProtectedRoute from "./pages/Recruiter/RecruiterProtectedRoute";
import JobBoard from "./pages/JobBoard";
import Preparation from "./pages/Preparation";
import JobApply from "./pages/JobApply";
import RecruiterApplicants from "./pages/Recruiter/RecruiterApplicants";
import RecruiterViewCandidates from "./pages/Recruiter/RecuiterViewCandidates";
import RecruiterPerformance from "./pages/Recruiter/RecruiterPerformance";
import NebulaBackground from "./NebulaBackground";
import RecruiterEditJob from "./pages/Recruiter/RecruiterEditJob";
import RecruiterJobDetail from "./pages/Recruiter/RecruiterJobDetail";
import RecruiterShortlisted from "./pages/Recruiter/RecruiterShortlisted";
import RecruiterShortlistedCandidates from "./pages/Recruiter/RecruiterShortlistedcandidates";

function App() {
  return (
    <Router>
       <NebulaBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Routes>
          <Route element={<Layout />}>

          {/* Public routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          

          <Route path="/homepage"       element={<ProtectedRoute> <Homepage />        </ProtectedRoute>}/>

          // ✅ Correct syntax
          <Route path="/interviewstage" element={<ProtectedRoute><InterviewStage /></ProtectedRoute>} />
          <Route path="/interviewstage/:jobId" element={<ProtectedRoute><InterviewStage /></ProtectedRoute>} />

          <Route path="/interview/:sessionId" element={<ProtectedRoute> <InterviewRoom />   </ProtectedRoute>}/> 

          <Route  path="/score"         element={<ProtectedRoute> <ScoreBoard />   </ProtectedRoute>}/>
          <Route path="/prep"           element={<ProtectedRoute> <Preparation />   </ProtectedRoute>}/>
            
          <Route path="/score/:sessionId" element={<ProtectedRoute><ScoreDetails /></ProtectedRoute>} />

          <Route  path="/job-board"         element={<ProtectedRoute> <JobBoard />   </ProtectedRoute>}/>
          <Route path="/job-apply/:jobId" element={<ProtectedRoute><JobApply /></ProtectedRoute>} />

          <Route  path="/profile"         element={<ProtectedRoute> <Profile />   </ProtectedRoute>}/>
          <Route  path="/updateProfile"         element={<ProtectedRoute> <UpdateGetProfile />   </ProtectedRoute>}/>

          {/* Subject-wise Interview */}
          <Route path="/subject-interview" element={ <ProtectedRoute> <SubjectWiseInterviewRoom /></ProtectedRoute>}/>
          
          {/* Subject Score Page */}
          <Route path="/subject-score/:sessionId" element={ <ProtectedRoute> <ScoreDetails /> </ProtectedRoute>}/>
          
          </Route>
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter-register" element={<RecruiterRegister/>}/>
            <Route path="/recruiter-login" element={<RecruiterLogin/>}/>
            <Route path="/create-job" element={<RecruiterProtectedRoute><CreateJob/></RecruiterProtectedRoute>}/>
            

            <Route path="/recruiter-dashboard" element={<RecruiterProtectedRoute><RecruiterDashboard /></RecruiterProtectedRoute>} />
            <Route path="/recruiter-homepage" element={<RecruiterProtectedRoute><RecruiterHomepage /></RecruiterProtectedRoute>} />
            <Route path="/recruiter-manage-jobs" element={<RecruiterProtectedRoute><RecruiterManageJobs /></RecruiterProtectedRoute>} />
            <Route path="/recruiter/jobs/edit/:jobId" element={<RecruiterProtectedRoute><RecruiterEditJob /></RecruiterProtectedRoute>} />
            <Route path="/recruiter/jobs/:jobId" element={<RecruiterProtectedRoute><RecruiterJobDetail  /></RecruiterProtectedRoute>} />
            <Route path="/recruiter-getAllJob" element={<RecruiterProtectedRoute><RecruiterGetAllJobs /></RecruiterProtectedRoute>} />
            <Route path="/recruiter-performance/:jobId" element={<RecruiterProtectedRoute><RecruiterApplicants /></RecruiterProtectedRoute>} />
            <Route path="/recruiter-viewcandidates" element={<RecruiterProtectedRoute><RecruiterViewCandidates /></RecruiterProtectedRoute>} />
            <Route path="/performance/:resultId" element={<RecruiterProtectedRoute><RecruiterPerformance /></RecruiterProtectedRoute>} />
           <Route path="/recruiter/job/shortlisted" element={<RecruiterProtectedRoute><RecruiterShortlisted /></RecruiterProtectedRoute>} />
           <Route path="/recruiter/job/shortlisted/:jobId" element={<RecruiterProtectedRoute><RecruiterShortlistedCandidates /></RecruiterProtectedRoute>} />
          </Route>
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
