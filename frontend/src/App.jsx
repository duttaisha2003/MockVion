// import React from 'react'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// import Dashboard from './pages/Dashboard'

// import  Login  from './pages/Login'
// import  Register  from './pages/Register'

// import Homepage from './pages/Homepage'

// import InterviewRoom from './pages/InterviewRoom'
// import InterviewStage from './pages/InterviewStage'

// import ScoreBoard from './pages/ScoreBoard'

// function App() {
//   return (
//     <Router>
      
        
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
            
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />

//             <Route path="/homepage" element={<Homepage/>} />

//             <Route path="/score" element={<ScoreBoard />} />
            
//             <Route path="/interviewstage" element={<InterviewStage />} />
//             <Route path="/interview/room" element={<InterviewRoom />} />

//           </Routes>
       
      
//     </Router>
//   )
// }

// export default App

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Layout from "./Layout";

// import Dashboard from "./pages/Dashboard";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Homepage from "./pages/Homepage";
// import InterviewRoom from "./pages/InterviewRoom";
// import InterviewStage from "./pages/InterviewStage";
// import ScoreBoard from "./pages/ScoreBoard";

// import ProtectedRoute from "./ProtectedRoute";

// function App() {
//   return (
//     <Router>
//       <Routes>
// {/* Layout with Navbar */}
//         <Route element={<Layout />}>
//         {/* Public routes */}
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

        

//           <Route
//             path="/homepage"
//             element={
//               <ProtectedRoute>
//                 <Homepage />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/interviewstage"
//             element={
//               <ProtectedRoute>
//                 <InterviewStage />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/interview/room"
//             element={
//               <ProtectedRoute>
//                 <InterviewRoom />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/score"
//             element={
//               <ProtectedRoute>
//                 <ScoreBoard />
//               </ProtectedRoute>
//             }
//           />

//         </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App;
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

import ProtectedRoute from "./ProtectedRoute";
import Profile from "./pages/Profile";
import UpdateGetProfile  from "./pages/UpdateGetProfile"
function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>

          {/* Public routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/homepage"       element={<ProtectedRoute> <Homepage />        </ProtectedRoute>}/>

          <Route path="/interviewstage" element={<ProtectedRoute> <InterviewStage />  </ProtectedRoute>}/>

          <Route path="/interview/:sessionId" element={<ProtectedRoute> <InterviewRoom />   </ProtectedRoute>}/> 

          <Route  path="/score"         element={<ProtectedRoute> <ScoreBoard />   </ProtectedRoute>}/>
            
          <Route path="/score/:sessionId" element={<ProtectedRoute><ScoreDetails /></ProtectedRoute>} />

          <Route  path="/profile"         element={<ProtectedRoute> <Profile />   </ProtectedRoute>}/>
          <Route  path="/updateProfile"         element={<ProtectedRoute> <UpdateGetProfile />   </ProtectedRoute>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
