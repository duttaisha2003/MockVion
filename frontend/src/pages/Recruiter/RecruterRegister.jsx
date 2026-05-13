import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function RecruiterRegister() {

  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/recruiter/register`,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(data),
        credentials:"include"
      });

      const result = await res.json();

      if(res.ok){
        toast.success("Registered successfully. Wait for admin approval.");
        setTimeout(() => navigate('/recruiter-login'), 2000);
      }else{
        toast.error(result.message);
      }

    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
   <>
    <ToastContainer position="top-right" autoClose={2000}  hideProgressBar={false}  newestOnTop
          closeOnClick  pauseOnHover  theme="colored"  toastStyle={{ borderRadius: '10px', fontSize: '14px' }}
        />
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">

        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-semibold text-sky-800 mb-6">
            Recruiter Register
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <input
              {...register("companyName")}
              placeholder="Company Name"
              className="w-full px-3 py-2 border rounded-lg"
            />

            <input
              {...register("companyWebsite")}
              placeholder="Company Website"
              className="w-full px-3 py-2 border rounded-lg"
            />

            <input
              {...register("email")}
              type="email"
              placeholder="Company Email"
              className="w-full px-3 py-2 border rounded-lg"
            />

            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border rounded-lg"
            />

            <button className="w-full py-3 bg-sky-700 text-white rounded-lg">
              REGISTER
            </button>

          </form>

          <p className="mt-4 text-center">
            Already registered?
            <button
              onClick={()=>navigate("/recruiter-login")}
              className="text-sky-700 ml-2"
            >
              Login
            </button>
          </p>

        </div>

        <div className="hidden md:block md:w-1/2">
          <img
            src="https://static.vecteezy.com/system/resources/previews/030/492/783/large_2x/cute-robot-working-on-a-laptop-3d-render-technology-concept-ai-generated-free-photo.jpg"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </div>
   </>
  );
}

export default RecruiterRegister;