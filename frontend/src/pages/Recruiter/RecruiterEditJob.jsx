import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, X, Plus, Loader2 } from "lucide-react";

const RecruiterEditJob = () => {
  const { jobId } = useParams(); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    skillsRequired: [],
    experienceRequired: { min: "", max: "" },
    salary: { min: "", max: "", currency: "INR" },
    lastDate: "",
  });

  // Fetch existing job data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/recruiter/job/${jobId}`,
          { withCredentials: true }
        );
        const job = res.data.job;

        setForm({
          title: job.title || "",
          description: job.description || "",
          skillsRequired: job.skillsRequired || [],
          experienceRequired: {
            min: job.experienceRequired?.min ?? "",
            max: job.experienceRequired?.max ?? "",
          },
          salary: {
            min: job.salary?.min ?? "",
            max: job.salary?.max ?? "",
            currency: job.salary?.currency || "INR",
          },
          lastDate: job.lastDate
            ? new Date(job.lastDate).toISOString().split("T")[0]
            : "",
        });
      } catch (err) {
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("exp.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        experienceRequired: { ...prev.experienceRequired, [key]: value },
      }));
    } else if (name.startsWith("salary.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        salary: { ...prev.salary, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addSkill = () => {
    const skill = skillInput.toLowerCase().trim();
    if (!skill || form.skillsRequired.includes(skill)) {
      setSkillInput("");
      return;
    }
    setForm((prev) => ({
      ...prev,
      skillsRequired: [...prev.skillsRequired, skill],
    }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required");
      return;
    }
    if (form.skillsRequired.length === 0) {
      setError("At least one skill is required");
      return;
    }
    if (!form.lastDate) {
      setError("Last date is required");
      return;
    }
    if (new Date(form.lastDate) < new Date()) {
      setError("Last date cannot be in the past");
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}api/recruiter/job/${jobId}`,
        form,
        { withCredentials: true }
      );
      navigate("/recruiter-manage-jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate("/recruiter-manage-jobs")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Manage Jobs
        </button>

        <h1 className="text-3xl font-bold mb-1">Edit Job</h1>
        <p className="text-gray-400 text-sm mb-8">
          Job ID: <span className="text-gray-300 font-mono">{jobId}</span>
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the role, responsibilities, and requirements..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition resize-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Skills Required <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Type a skill and press Enter"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition text-sm"
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-2.5 rounded-lg transition"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skillsRequired.map((skill, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-sm text-gray-300"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-gray-500 hover:text-red-400 transition"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Experience Required (years)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  name="exp.min"
                  value={form.experienceRequired.min}
                  onChange={handleChange}
                  min={0}
                  placeholder="Min (e.g. 1)"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="exp.max"
                  value={form.experienceRequired.max}
                  onChange={handleChange}
                  min={0}
                  placeholder="Max (e.g. 5)"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Salary Range
            </label>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                name="salary.min"
                value={form.salary.min}
                onChange={handleChange}
                min={0}
                placeholder="Min"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition"
              />
              <input
                type="number"
                name="salary.max"
                value={form.salary.max}
                onChange={handleChange}
                min={0}
                placeholder="Max"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition"
              />
              <select
                name="salary.currency"
                value={form.salary.currency}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {/* Last Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Application Last Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="lastDate"
              value={form.lastDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/recruiter-manage-jobs")}
              className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 py-3 rounded-lg font-semibold transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition text-sm"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruiterEditJob;