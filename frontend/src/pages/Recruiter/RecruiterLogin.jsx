
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRecruiterAuth } from "./RecruiterAuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
function RecruiterLogin(){
  const { ensureRecruiterLoaded } = useRecruiterAuth();
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const onSubmit = async (data) => {
  try {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}api/recruiter/login`,
      data,
      { withCredentials: true }
    );

    await ensureRecruiterLoaded();
    console.log("hi")
    navigate("/recruiter-homepage");

  } catch (error) {
    alert(error.response?.data?.message || "Login failed");
  }
};

  return(
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-8">

      <div className="flex w-full max-w-3xl bg-white rounded-xl overflow-hidden">

        <div className="w-1/2 p-8">

          <h2 className="text-4xl text-sky-800 mb-6">
            Recruiter Login
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block text-sky-700 font-medium">EMAIL</label>
            <input
              {...register("email")}
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg"
            />
            <label className="block text-sky-700 font-medium">PASSWORD</label>
            <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg"
            />
            {/* Eye Button */}
            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            </div>
            <button className="w-full py-3 bg-sky-700 text-white rounded-lg">
              Login
            </button>

          </form>
          <p className="text-center mt-4">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/recruiter-register")}
              className="text-sky-700 font-semibold"
            >
              REGISTER
            </button>
          </p>
        </div>

        <div className="w-1/2">
          <img
            src="https://static.vecteezy.com/system/resources/previews/030/492/783/large_2x/cute-robot-working-on-a-laptop-3d-render-technology-concept-ai-generated-free-photo.jpg"
            className="w-full h-full object-cover"
          />
        </div>

      </div>

    </div>
  );
}

export default RecruiterLogin;