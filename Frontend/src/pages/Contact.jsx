import React from "react";
import { Phone, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
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
              Contact Us
            </h1>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg lg:mx-0">
              Have a question about our products, your order, or anything
              related to ELECTRA? We'd be happy to hear from you. Get in touch
              with us and we'll help you with your query.
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

              <p className="text-sm font-bold uppercase tracking-wider text-[#255DD0]">
                Get in Touch
              </p>

              <h2 className="mt-3 text-2xl font-bold text-gray-950 sm:text-3xl">
                Contact Information
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                We're available to help with your questions and concerns.
              </p>


              {/* Phone */}
              <a
                href="tel:+923264243320"
                className="group mt-8 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#255DD0] hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#255DD0] transition group-hover:bg-[#255DD0] group-hover:text-white">
                  <Phone size={22} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Phone
                  </p>

                  <p className="mt-1 break-words text-base font-semibold text-gray-900 sm:text-lg">
                    +92 326 4243320
                  </p>
                </div>
              </a>

            </div>

          </section>

        </div>
      </div>
    </main>
  );
};

export default Contact;