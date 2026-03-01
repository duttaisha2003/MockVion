import { useAuth } from "../AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
function Profile() {
  const { user, loading, ensureProfileLoaded } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    ensureProfileLoaded();
  }, []);


  // 1. Wait for auth resolution
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  // 2. Not logged in
  if ( !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">User not logged in</p>
      </div>
    );
  }

  // 3. Logged in → render profile
  return (
    <div className="min-h-screen bg-black  flex justify-center items-center px-4">
      <div className="bg-gray-900 w-full max-w-3xl rounded-xl shadow-lg p-8">

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6">
          <div className="relative">
            <img
              src={
                user.image ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border"
            />

          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-500 capitalize">{user.role}</p>
            <p className="text-sm text-gray-400">{user.emailId}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-white">
          <ProfileField label="First Name"  value={user.firstName} />
          <ProfileField label="Last Name" value={user.lastName} />
          <ProfileField label="Email" value={user.emailId} />
          <ProfileField label="Mobile" value={user.mobile || "Not provided"} />
          <ProfileField label="Age" value={user.age || "Not provided"} />
          <ProfileField label="Role" value={user.role} />
        </div>
        {/* Update Profile Details */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => navigate("/updateProfile")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Update Profile
          </button>
        </div>

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

export default Profile;
