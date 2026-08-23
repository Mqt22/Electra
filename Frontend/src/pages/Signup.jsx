import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Signup failed"
        );
      }

      // Save the newly created user as logged in
      setUser({
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        password: data.password,
        role:data.role,
        picture: data.picture ?? null,
      });

      navigate("/", { replace: true });

    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:flex">

      {/* Left Image */}
      <div className="relative hidden min-h-screen overflow-hidden lg:block lg:w-1/2">

        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80"
          alt="Ecommerce shopping"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute bottom-12 left-12 max-w-lg text-white">

          <h1 className="text-4xl font-bold xl:text-5xl">
            Everything you need,
            <br />
            all in one place.
          </h1>

          <p className="mt-4 text-base text-white/80">
            Create your Electra account today.
          </p>

        </div>
      </div>

      {/* Signup */}
      <div className="flex min-h-screen w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">

        <div className="w-full max-w-md">

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="mb-10 flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-700 text-lg font-bold text-white">
              E
            </div>

            <span className="text-xl font-semibold text-gray-900">
              Electra
            </span>
          </button>

          {/* Heading */}
          <div className="mb-8">

            <h2 className="text-3xl font-semibold text-gray-900">
              Create account
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Create your Electra account.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>

            {/* Name */}
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
                placeholder="Enter your name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
              />

            </div>

            {/* Email */}
            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
              />

            </div>

            {/* Password */}
            <div className="mt-5">

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
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
              />

            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating account..."
                : "Sign Up"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Signup;