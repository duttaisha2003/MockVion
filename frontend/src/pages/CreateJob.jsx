// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import axios from "axios";

// function CreateJob() {

//   const { register, handleSubmit, setValue, reset  } = useForm();

//   const [jobRole, setJobRole] = useState("");
//   const [customRole, setCustomRole] = useState("");
//   const [experience, setExperience] = useState("");
//   const [loadingAI, setLoadingAI] = useState(false);

//   // Called when recruiter selects job title
//   const handleTitleChange = async (title, level) => {
//   if (!title || !level) return; // wait until both selected

//   setValue("title", title);

//   try {
//     setLoadingAI(true);

//     const res = await axios.post(
//       `${import.meta.env.VITE_BACKEND_URL}api/recruiter/ai/job-template`,
//       { title, level }, // ✅ BOTH in one object
//       { withCredentials: true }
//     );

//     setValue("description", res.data.description);
//     setValue("skills", res.data.skills.join(", "));
//   } catch (error) {
//     console.error(error);
//   } finally {
//     setLoadingAI(false);
//   }
// };

//   const onSubmit = async (data) => {

//     const jobData = {
//       title: data.title,
//       description: data.description,

//       experienceRequired: {
//         min: Number(data.minExp),
//         max: Number(data.maxExp)
//       },

//       skillsRequired: data.skills.split(",").map(s => s.trim()),

//       salary: {
//         min: Number(data.minSalary),
//         max: Number(data.maxSalary),
//         currency: "INR"
//       },

//       lastDate: data.lastDate
//     };
//     try {

//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}api/recruiter/create-job`,
//         jobData,
//         { withCredentials: true }
//       );

//       alert("Job created successfully");
//       reset();

//     } catch (error) {

//       alert(error.response?.data?.message);

//     }
//   };

//  return (

//   <div className="min-h-screen flex items-center justify-center bg-black">

//     <div className="bg-white p-10 rounded-xl w-[800px]">

//       <h2 className="text-3xl text-sky-800 mb-6">
//         Create Job
//       </h2>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

//         {/* Job Role Dropdown */}
//         <div>
//           {/* Job Role */}
//           <label className="block text-sm font-semibold mb-1">
//             Select Job Role
//           </label>

//           <select
//             value={jobRole}
//             onChange={(e) => {
//               const value = e.target.value;
//               setJobRole(value);

//               const finalRole = value === "Other" ? customRole : value;

//               handleTitleChange(finalRole, experience);
//             }}
//             className="w-full px-3 py-2 border rounded"
//           >
//             <option value="">Select Job Role</option>
//             <option value="MERN Developer">MERN Developer</option>
//             <option value="Frontend Developer">Frontend Developer</option>
//             <option value="Backend Developer">Backend Developer</option>
//             <option value="Java Developer">Java Developer</option>
//             <option value="Python Developer">Python Developer</option>
//             <option value="AI/ML Engineer">AI/ML Engineer</option>
//             <option value="Other">Other (Type below)</option>
//           </select>

//           {/* Custom Role */}
//           {jobRole === "Other" && (
//             <input
//               type="text"
//               placeholder="Enter custom role"
//               value={customRole}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 setCustomRole(value);
//                 handleTitleChange(value, experience);
//               }}
//               className="w-full mt-2 px-3 py-2 border rounded"
//             />
//           )}

//           {/* Experience Level */}
//           <label className="block text-sm font-semibold mt-4 mb-1">
//             Experience Level
//           </label>

//           <select
//             value={experience}
//             onChange={(e) => {
//               const value = e.target.value;
//               setExperience(value);

//               const finalRole = jobRole === "Other" ? customRole : jobRole;

//               handleTitleChange(finalRole, value);
//             }}
//             className="w-full px-3 py-2 border rounded"
//           >
//             <option value="">Select Experience</option>
//             <option value="Fresher">Fresher</option>
//             <option value="Experienced">Experienced</option>
//           </select>
//         </div>

//         {/* Job Title */}
//         <div>
//           <label className="block text-sm font-semibold mb-1">
//             Job Title
//           </label>
//           <input
//             {...register("title")}
//             placeholder="Enter job title"
//             className="w-full px-3 py-2 border rounded"
//           />
//         </div>

//         {/* Job Description */}
//         <div>
//           <label className="block text-sm font-semibold mb-1">
//             Job Description
//           </label>
//           <textarea
//             {...register("description")}
//             placeholder="Enter job description"
//             rows="5"
//             className="w-full px-3 py-2 border rounded"
//           />
//         </div>

//         {loadingAI && (
//           <p className="text-sm text-gray-500">
//             Generating job description with AI...
//           </p>
//         )}

//         {/* Experience */}
//         <div className="grid grid-cols-2 gap-4">
          
//           <div>
//             <label className="block text-sm font-semibold mb-1">
//               Min Experience (Years)
//             </label>
//             <input
//               {...register("minExp", {
//                 required: true,
//                 min: 0,
//                 max: 50
//               })}
//               placeholder="0"
//               type="number"
//               min="0"
//               max="50"
//               className="w-full px-3 py-2 border rounded"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold mb-1">
//               Max Experience (Years)
//             </label>
//             <input
//               {...register("maxExp", {
//                 required: true,
//                 min: 0,
//                 max: 50
//               })}
//               placeholder="5"
//               type="number"
//               min="0"
//               max="50"
//               className="w-full px-3 py-2 border rounded"
//             />
//           </div>

//         </div>

//         {/* Skills */}
//         <div>
//           <label className="block text-sm font-semibold mb-1">
//             Required Skills
//           </label>
//           <textarea
//             {...register("skills")}
//             placeholder="React, Node.js, MongoDB"
//             rows="3"
//             className="w-full px-3 py-2 border rounded"
//           />
//         </div>
//         {/* Salary */}
// <div className="grid grid-cols-2 gap-4">

//   <div>
//     <label className="block text-sm font-semibold mb-1">
//       Min Salary (₹)
//     </label>
//     <input
//       {...register("minSalary")}
//       type="number"
//       placeholder="300000"
//       className="w-full px-3 py-2 border rounded"
//     />
//   </div>

//   <div>
//     <label className="block text-sm font-semibold mb-1">
//       Max Salary (₹)
//     </label>
//     <input
//       {...register("maxSalary")}
//       type="number"
//       placeholder="600000"
//       className="w-full px-3 py-2 border rounded"
//     />
//   </div>

// </div>

// {/* Last Date */}
// <div>
//   <label className="block text-sm font-semibold mb-1">
//     Last Date to Apply
//   </label>
//   <input
//     {...register("lastDate", { required: true })}
//     type="date"
//     className="w-full px-3 py-2 border rounded"
//   />
// </div>
//         {/* Button */}
//         <button className="w-full py-3 bg-sky-700 text-white rounded-lg hover:bg-sky-800 transition">
//           Create Job
//         </button>

//       </form>

//     </div>

//   </div>

// );
// }

// export default CreateJob;import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
function CreateJob() {
  const { register, handleSubmit, setValue, reset } = useForm();

  const [jobRole, setJobRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [experience, setExperience] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = async (title, level) => {
    if (!title || !level) return;

    setValue("title", title);

    try {
      setLoadingAI(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/recruiter/ai/job-template`,
        { title, level },
        { withCredentials: true }
      );

      setValue("description", res.data.description);
      setValue("skills", res.data.skills.join(", "));
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoadingAI(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const jobData = {
      title: data.title,
      description: data.description,
      experienceRequired: {
        min: Number(data.minExp),
        max: Number(data.maxExp),
      },
      skillsRequired: data.skills.split(",").map((s) => s.trim()),
      salary: {
        min: Number(data.minSalary),
        max: Number(data.maxSalary),
        currency: "INR",
      },
      lastDate: data.lastDate,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/recruiter/create-job`,
        jobData,
        { withCredentials: true }
      );

      toast.success("Job created successfully!");
      reset();
      setJobRole("");
      setCustomRole("");
      setExperience("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        toastStyle={{ borderRadius: "10px", fontSize: "14px" }}
      />

      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="bg-white p-10 mt-5 mb-5 rounded-xl w-[800px]">
          <h2 className="text-3xl text-sky-800 mb-6">Create Job</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Job Role */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Select Job Role
              </label>
              <select
                value={jobRole}
                onChange={(e) => {
                  const value = e.target.value;
                  setJobRole(value);
                  const finalRole = value === "Other" ? customRole : value;
                  handleTitleChange(finalRole, experience);
                }}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select Job Role</option>
                <option value="MERN Developer">MERN Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Java Developer">Java Developer</option>
                <option value="Python Developer">Python Developer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Other">Other (Type below)</option>
              </select>

              {/* Custom Role */}
              {jobRole === "Other" && (
                <input
                  type="text"
                  placeholder="Enter custom role"
                  value={customRole}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomRole(value);
                    handleTitleChange(value, experience);
                  }}
                  className="w-full mt-2 px-3 py-2 border rounded"
                />
              )}

              {/* Experience Level */}
              <label className="block text-sm font-semibold mt-4 mb-1">
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => {
                  const value = e.target.value;
                  setExperience(value);
                  const finalRole = jobRole === "Other" ? customRole : jobRole;
                  handleTitleChange(finalRole, value);
                }}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select Experience</option>
                <option value="Fresher">Fresher</option>
                <option value="Experienced">Experienced</option>
              </select>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Job Title
              </label>
              <input
                {...register("title")}
                placeholder="Enter job title"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Job Description
              </label>
              <textarea
                {...register("description")}
                placeholder="Enter job description"
                rows="5"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {loadingAI && (
              <p className="text-sm text-sky-500 animate-pulse">
                Generating job description with AI...
              </p>
            )}

            {/* Experience Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Min Experience (Years)
                </label>
                <input
                  {...register("minExp", { required: true, min: 0, max: 50 })}
                  placeholder="0"
                  type="number"
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Max Experience (Years)
                </label>
                <input
                  {...register("maxExp", { required: true, min: 0, max: 50 })}
                  placeholder="5"
                  type="number"
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Required Skills
              </label>
              <textarea
                {...register("skills")}
                placeholder="React, Node.js, MongoDB"
                rows="3"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Min Salary (₹)
                </label>
                <input
                  {...register("minSalary")}
                  type="number"
                  placeholder="300000"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Max Salary (₹)
                </label>
                <input
                  {...register("maxSalary")}
                  type="number"
                  placeholder="600000"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* Last Date */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Last Date to Apply
              </label>
              <input
                {...register("lastDate", { required: true })}
                type="date"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 text-white rounded-lg font-semibold transition
                ${isSubmitting
                  ? "bg-sky-400 cursor-not-allowed"
                  : "bg-sky-700 hover:bg-sky-800 cursor-pointer"
                }`}
            >
              {isSubmitting ? "Creating..." : "Create Job"}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}

export default CreateJob;