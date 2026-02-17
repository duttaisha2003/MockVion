import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const signupSchema = z.object({
  fname: z.string().min(3, "First Name should contain at least 3 characters"),
  lname: z.string().min(3, "Last Name should contain at least 3 characters"),
  emailId: z.string().email("Please enter a valid email address"),
  mobile: z.string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^[0-9]+$/, "Mobile number must contain only digits"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
});

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fname: "",
      lname: "",
      emailId: "",
      mobile: "",
      password: "",
    }
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const userData = {
      firstName: data.fname,
      lastName: data.lname,
      emailId: data.emailId,
      mobile: data.mobile,
      password: data.password,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        console.log('User registered successfully');
        navigate('/login');
      } else {
        console.error('Registration failed:', result.error);
        alert(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Left panel - Form */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-3xl font-semibold text-sky-800 mb-6 text-center md:text-left">
              Create Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sky-700 font-medium">FIRST NAME</label>
                <input
                  {...register('fname')}
                  placeholder="Enter your First name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.fname && (
                  <p className="mt-1 text-sm text-red-600">{errors.fname.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-green-700 font-medium">LAST NAME</label>
                <input
                  {...register('lname')}
                  placeholder="Enter your Last name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.lname && (
                  <p className="mt-1 text-sm text-red-600">{errors.lname.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-green-700 font-medium">EMAIL</label>
                <input
                  {...register('emailId')}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.emailId && (
                  <p className="mt-1 text-sm text-red-600">{errors.emailId.message}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <label className="block text-green-700 font-medium">MOBILE NUMBER</label>
                <input
                  {...register('mobile')}
                  type="tel"
                  placeholder="Enter your Mobile Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sky-600 font-medium">PASSWORD</label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Create a password"
                  className="w-full px-3 py-2 border border-sky-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-sky-700 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors mt-6"
              >
                REGISTER
              </button>
            </form>

            {/* Link to login (visible only on small screens) */}
            <div className="text-center mt-6 md:hidden">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-green-700 font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>

          {/* Right panel - Image with Sign In (visible only on md and up) */}
          <div className="hidden md:block md:w-1/2 relative">
            <img
              src="https://static.vecteezy.com/system/resources/previews/030/492/783/large_2x/cute-robot-working-on-a-laptop-3d-render-technology-concept-ai-generated-free-photo.jpg"
              alt="Education"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/40">
              <div className="text-center text-white">
                <h3 className="text-3xl font-bold mb-4">Welcome Back!</h3>
                <p className="mb-6">
                  Already have an account? Sign in to continue your journey.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-green-800 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;