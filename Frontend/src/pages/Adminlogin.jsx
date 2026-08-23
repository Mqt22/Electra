import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      console.log("ADMIN LOGIN Name:", name);
      console.log("ADMIN LOGIN PASSWORD:", password);

      const response = await fetch(
        "http://localhost:8000/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("ADMIN LOGIN STATUS:", response.status);
      console.log("ADMIN LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid email or password"
        );
      }

      localStorage.setItem(
        "electra_admin",
        JSON.stringify({
          user_id: data.user_id,
          name: data.name,
          picture: data.picture || null,
        })
      );

      window.dispatchEvent(new Event("adminAuthChanged"));

      navigate("/admin/dashboard");

      navigate("/admin/dashboard");

    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">

            <span className="font-bold text-white text-xl">
              E
            </span>

          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to manage your store
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}


        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* Email */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter your Name"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />

          </div>


          {/* Password */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />

          </div>


          {/* Login */}

          <button
            type="submit"
            onClick={() => console.log("LOGIN BUTTON CLICKED")}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default AdminLogin;