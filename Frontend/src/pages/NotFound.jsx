import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">

        <div className="mb-4 text-8xl font-bold tracking-tight text-gray-200 sm:text-9xl">
          404
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Page Not Found
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
          The page you're looking for doesn't exist or may have
          been moved.
        </p>

        <button
          onClick={() => navigate("/shop")}
          className="mt-7 rounded-lg bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-95"
        >
          Back to Shop
        </button>

      </div>
    </div>
  );
};

export default NotFound;