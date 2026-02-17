
import React, { useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";


const HomePage = () => {
  const { user, loading } = useAuth();

  /* -------- Resume Upload States -------- */
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Auth still loading → don't render page yet
  if (loading) return null;

  /* ---------------- Upload Resume ---------------- */
  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setUploadError("Please select a resume file (PDF/DOCX)");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadSuccess(false);

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}resume/upload`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Resume upload failed");
      }

      setUploadSuccess(true);
    } catch (err) {
      console.error(err);
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ================= HERO ================= */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-800">
              Prepare Smarter.{" "}
              <span className="text-sky-700">Interview Better.</span>
            </h1>

            <p className="text-gray-600 text-lg">
              AI-powered mock interviews tailored to your resume.
            </p>

            {user && (
              <p className="text-gray-700 font-medium">
                Welcome back, <span className="text-sky-700">{user.firstName}</span>
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <img
              src="https://www.shutterstock.com/image-vector/artificial-intelligence-robot-modern-technology-600nw-2613162515.jpg"
              alt="AI Interview"
              className="rounded-xl shadow-lg max-w-lg"
            />
          </div>
        </div>
      </section>

      {/* ================= UPLOAD RESUME ================= */}
      <section className="bg-white py-16">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">

          <h2 className="text-3xl font-bold text-gray-800">
            Upload Your Resume
          </h2>

          <p className="text-gray-600">
            Upload your resume (PDF or DOCX). Our AI will analyze it and prepare
            personalized interview questions.
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files[0])}
            className="w-full border rounded-lg p-3"
          />

          <button
            onClick={handleResumeUpload}
            disabled={uploading}
            className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition flex justify-center items-center gap-2"
          >
            {uploading ? "Uploading..." : "Upload Resume"}
            <UploadCloud size={20} />
          </button>

          {uploadSuccess && (
            <p className="flex items-center justify-center gap-2 text-green-600 font-medium">
              <CheckCircle size={18} /> Resume uploaded successfully
            </p>
          )}

          {uploadError && (
            <p className="flex items-center justify-center gap-2 text-red-600 font-medium">
              <AlertCircle size={18} /> {uploadError}
            </p>
          )}
        </div>
      </section>

      {/* ================= INTERVIEW CTA ================= */}
      <section className="bg-gray-100 py-14">
        <div className="max-w-4xl mx-auto text-center px-6 space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Ready for Your Mock Interview?
          </h2>

          <p className="text-gray-600 text-lg">
            Start your AI-powered interview after uploading your resume.
          </p>

          <Link
            to="/interviewstage"
            className={`inline-block mt-4 px-8 py-3 rounded-lg font-semibold transition ${
              uploadSuccess
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            Start Interview
          </Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
