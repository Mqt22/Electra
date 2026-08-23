import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { UserCircle, Upload, ArrowLeft } from "lucide-react";

const Profile = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [picture, setPicture] = useState(null);
    const [theme, setTheme] = useState("system");

    const [pictureChanged, setPictureChanged] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const loadProfile = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8000/profile/${encodeURIComponent(
                        user.email
                    )}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Failed to load profile"
                    );
                }

                setName(data.name || "");
                setEmail(data.email || "");
                setPassword(data.password || "");
                setPicture(data.picture || null);
                setTheme(data.theme || "system");
                setPictureChanged(false);

            } catch (error) {
                console.error(
                    "Profile loading error:",
                    error
                );

                setError(error.message);

            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user, navigate]);


    const handlePictureChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            setPicture(reader.result);

            // IMPORTANT:
            // Tell handleSave that a new image was selected.
            setPictureChanged(true);
        };

        reader.readAsDataURL(file);
    };


    const handleSave = async () => {

        setError("");
        setSuccess("");
        setSaving(true);

        try {

            const updateData = {
                name: name,
                password: password,
                theme: theme,
            };

            // Only send picture when the user actually
            // selected a new image.
            if (pictureChanged) {
                updateData.picture = picture;
            }

            const response = await fetch(
                `http://localhost:8000/profile/${encodeURIComponent(
                    user.email
                )}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(updateData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Failed to update profile"
                );
            }

            // Update AuthContext
            setUser(data.profile);

            // Update local state
            setName(data.profile.name || "");
            setEmail(data.profile.email || "");
            setPassword(data.profile.password || "");
            setPicture(data.profile.picture || null);
            setTheme(data.profile.theme || "system");

            // Image has now been saved.
            setPictureChanged(false);

            setSuccess(
                "Profile updated successfully."
            );

        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );

            setError(
                error.message ||
                "Failed to update profile."
            );

        } finally {

            setSaving(false);

        }
    };


    if (!user || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">
                    Loading profile...
                </p>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">

            <div className="mx-auto max-w-2xl">

                <button
                    onClick={() => navigate("/")}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </button>


                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

                    <h1 className="text-2xl font-semibold text-gray-900">
                        Profile Settings
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your Electra account.
                    </p>


                    {/* Profile Picture */}

                    <div className="mt-8 flex flex-col items-center">

                        <div className="relative">

                            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-100">

                                {picture ? (
                                    <img
                                        src={picture}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserCircle
                                        size={80}
                                        className="text-gray-400"
                                    />
                                )}

                            </div>


                            <label
                                htmlFor="picture"
                                className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#255DD0] text-white shadow-md hover:bg-blue-700"
                            >
                                <Upload size={17} />
                            </label>


                            <input
                                id="picture"
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
                                Username
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* Email */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none"
                            />

                            <p className="mt-1 text-xs text-gray-400">
                                Your email cannot be changed.
                            </p>

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
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#255DD0] focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>


                    {/* Save */}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="mt-8 w-full rounded-lg bg-[#255DD0] px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

export default Profile;