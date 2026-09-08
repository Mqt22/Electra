import React from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ================= LEFT SIDE ================= */}
          <section className="text-center lg:text-left">

            {/* Logo */}
            <Link
              to="/"
              className="inline-block text-3xl font-extrabold tracking-tight text-[#255DD0] sm:text-4xl"
            >
              ELECTRA
            </Link>

            {/* Heading */}
            <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Coming Soon
            </h1>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg lg:mx-0">
              We're working on something new for ELECTRA. This page is
              currently being developed and will be available soon. Stay
              tuned for what's coming next.
            </p>

            {/* Back to Store */}
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#255DD0] hover:text-[#255DD0]"
            >
              <ArrowLeft size={17} />
              Back to Store
            </Link>

          </section>


          {/* ================= RIGHT SIDE ================= */}
          <section className="flex justify-center lg:justify-end">

            <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-[#F7F8FA] p-7 shadow-sm sm:p-9">

              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#255DD0]">
                <Clock size={30} />
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-wider text-[#255DD0]">
                ELECTRA
              </p>

              <h2 className="mt-3 text-2xl font-bold text-gray-950 sm:text-3xl">
                Something new is on the way.
              </h2>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                We're putting the finishing touches on this part of the
                ELECTRA experience. Check back soon to see what's new.
              </p>

              {/* Progress decoration */}
              <div className="mt-8">
                <div className="flex items-center justify-between text-xs font-medium text-gray-400">
                  <span>Under Development</span>
                  <span>Coming Soon</span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full w-2/3 rounded-full bg-[#255DD0]" />
                </div>
              </div>

            </div>

          </section>

        </div>
      </div>
    </main>
  );
};

export default ComingSoon;