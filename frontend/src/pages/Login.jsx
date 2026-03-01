
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { z } from "zod";
import axios from "axios";
import { useAuth } from "../AuthContext";

const loginSchema = z.object({
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

function Login() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/login`,
        {
          emailId: data.emailId,
          password: data.password,
        },
        {
          withCredentials: true, 
        }
        
      );
      //  Update global auth state
      //setUser(res.data.user);
      setIsAuthenticated(res.data.user);

      console.log("Login successful");
      navigate("/homepage");
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
      <div className="flex flex-col md:flex-row w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Left panel */}
        <div className="md:w-1/2 p-8">
          <h2 className="text-4xl font-semibold text-sky-800 mb-6">Log In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">

            {/* Email */}
            <div>
              <label className="block text-sky-700 font-medium">EMAIL</label>
              <input
                {...register("emailId")}
                type="email"
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Enter your email"
              />
              {errors.emailId && (
                <p className="text-red-600">{errors.emailId.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sky-700 font-medium">PASSWORD</label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-700 text-white rounded-lg font-semibold"
            >
              Log In
            </button>
          </form>

          <p className="text-center mt-4">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-sky-700 font-semibold"
            >
              REGISTER
            </button>
          </p>
        </div>

        {/* Right panel */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src="https://static.vecteezy.com/system/resources/previews/030/492/783/large_2x/cute-robot-working-on-a-laptop-3d-render-technology-concept-ai-generated-free-photo.jpg"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
//another side image is here(different design only)
{/* <div className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
  <div className="flex flex-col md:flex-row w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">

    
    <div className="hidden md:block md:w-1/2 relative">
      <img
        src="https://static.vecteezy.com/system/resources/previews/030/492/783/large_2x/cute-robot-working-on-a-laptop-3d-render-technology-concept-ai-generated-free-photo.jpg"
        alt="Login visual"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>


    <div className="md:w-1/2 p-8">
      <h2 className="text-4xl font-semibold text-sky-800 mb-6">Log In</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">

      
        <div>
          <label className="block text-sky-700 font-medium">EMAIL</label>
          <input
            {...register("emailId")}
            type="email"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Enter your email"
          />
          {errors.emailId && (
            <p className="text-red-600 text-sm mt-1">
              {errors.emailId.message}
            </p>
          )}
        </div>

       
        <div>
          <label className="block text-sky-700 font-medium">PASSWORD</label>
          <input
            {...register("password")}
            type="password"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-semibold transition duration-200"
        >
          Log In
        </button>
      </form>

      <p className="text-center mt-4 text-sm">
        Don’t have an account?{" "}
        <button
          onClick={() => navigate("/register")}
          className="text-sky-700 font-semibold hover:underline"
        >
          REGISTER
        </button>
      </p>
    </div>

  </div>
</div> 
*/}
