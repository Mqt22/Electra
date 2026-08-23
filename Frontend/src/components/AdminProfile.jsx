import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  Upload,
  ArrowLeft,
} from "lucide-react";

const AdminProfile = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [picture, setPicture] = useState(null);

  const [pictureChanged, setPictureChanged] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD ADMIN
  // =====================================================

  useEffect(() => {
    const storedAdmin = localStorage.getItem("electra_admin");

    if (!storedAdmin) {
      navigate("/admin/login");
      return;
    }

    try {
      const adminData = JSON.parse(storedAdmin);

      setAdmin(adminData);

      const loadAdminProfile = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/admin/profile/${adminData.user_id}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.detail || "Failed to load admin profile"
            );
          }

          setName(data.name || "");
          setPassword(data.password || "");
          setPicture(data.picture || null);

          setPictureChanged(false);

        } catch (error) {
          console.error(
            "Admin profile loading error:",
            error
          );

          setError(
            error.message ||
            "Failed to load admin profile."
          );
        } finally {
          setLoading(false);
        }
      };

      loadAdminProfile();

    } catch (error) {
      console.error(
        "Invalid admin data:",
        error
      );

      localStorage.removeItem("electra_admin");

      navigate("/admin/login");
    }
  }, [navigate]);

  // =====================================================
  // CHANGE PICTURE
  // =====================================================

  const handlePictureChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setPicture(reader.result);
      setPictureChanged(true);
    };

    reader.readAsDataURL(file);
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updateData = {
        name: name,
        password: password,
      };

      if (pictureChanged) {
        updateData.picture = picture;
      }

      const response = await fetch(
        `http://localhost:8000/admin/profile/${admin.user_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      console.log("ADMIN PROFILE PUT RESPONSE:", data);
      console.log("UPDATED PICTURE:", data.profile?.picture);

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to update admin profile"
        );
      }

      // Update admin state
      const updatedAdmin = {
        ...admin,
        name: data.profile.name,
        password: data.profile.password,
        picture: data.profile.picture || null
      };

      setAdmin(updatedAdmin);

      // Update localStorage
      localStorage.setItem(
        "electra_admin",
        JSON.stringify(updatedAdmin)
      );

      // Update local state
      setName(data.profile.name || "");
      setPassword(data.profile.password || "");
      setPicture(data.profile.picture || null);

      setPictureChanged(false);

      setSuccess(
        "Admin profile updated successfully."
      );

    } catch (error) {
      console.error(
        "Admin profile update error:",
        error
      );

      setError(
        error.message ||
        "Failed to update admin profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!admin || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading admin profile...
        </p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#2563eb]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your admin account information.
            </p>
          </div>

          {/* Profile Picture */}
          <div className="mt-8 flex flex-col items-center">

            <div className="relative">

              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-100">

                {picture ? (
                  <img
                    src={picture}
                    alt="Admin Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle
                    size={80}
                    className="text-gray-400"
                  />
                )}

              </div>

              {/* Upload */}
              <label
                htmlFor="admin-picture"
                className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#2563eb] text-white shadow-md transition hover:bg-blue-700"
              >
                <Upload size={17} />
              </label>

              <input
                id="admin-picture"
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />

            </div>

            <p className="mt-3 text-xs text-gray-400">
              Click the upload button to change your picture.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Fields */}
          <div className="mt-8 space-y-5">

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Admin Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="text"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-8 w-full rounded-lg bg-[#2563eb] px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default AdminProfile;