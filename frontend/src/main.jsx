import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./AuthContext";
import {RecruiterAuthProvider} from "./pages/Recruiter/RecruiterAuthContext.jsx"

createRoot(document.getElementById("root")).render(
   <StrictMode>
    <AuthProvider>
      <RecruiterAuthProvider>   
        <App />
      </RecruiterAuthProvider>
    </AuthProvider>
  </StrictMode>
);
