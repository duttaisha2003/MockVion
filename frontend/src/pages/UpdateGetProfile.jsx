import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function UpdateGetProfile() {
  const { user, loading, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [age, setAge] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  // Prefill existing data
  useEffect(() => {
    if (user) {
      setAge(user.age || "");
      setPreview(user.image || "");   // ✅ FIXED HERE
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("age", age);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const result = await updateProfile(formData);

    setSaving(false);

    if (result.success) {
      navigate("/profile");
    } else {
      alert("Update failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit}>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6">
            <div className="relative">
              <img
                src={
                  preview ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border"
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-3 text-sm"
              />
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-800">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-500 capitalize">{user.role}</p>
              <p className="text-sm text-gray-400">{user.emailId}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <ProfileField label="First Name" value={user.firstName} />
            <ProfileField label="Last Name" value={user.lastName} />
            <ProfileField label="Email" value={user.emailId} />
            <ProfileField label="Mobile" value={user.mobile || "Not provided"} />

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800"
              />
            </div>

            <ProfileField label="Role" value={user.role} />
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <div className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-800">
        {value}
      </div>
    </div>
  );
}

export default UpdateGetProfile;
