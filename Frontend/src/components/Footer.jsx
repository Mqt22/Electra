import { React, useState, useEffect } from "react";
import { Globe, AtSign, Share2 } from "lucide-react";
import { Link } from "react-router-dom"

const footerLinks = {
  "Company Info": [
    { name: "About Us", path: "/about" },
    { name: "Careers", path: "/comming" },
    { name: "Press", path: "/comming" },
    { name: "Contact", path: "/contact" },
  ],

  "Quick Links": [
    { name: "New Arrivals", path: "/comming" },
    { name: "Best Sellers", path: "/comming" },
    { name: "Store Locator", path: "/comming" },
    { name: "Gift Cards", path: "/comming" },
  ],

  "Customer Service": [
    { name: "Shipping Info", path: "/comming" },
    { name: "Returns", path: "/comming" },
    { name: "Support Center", path: "/comming" },
    { name: "FAQ", path: "/comming" },
  ],
};

const Footer = () => {

  const [email, setEmail] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save email");
      }

      setEmail("");
    } catch (error) {
      console.error("Failed to save email:", error);
    }
  };
  return (
    <footer className="w-full py-2">
      {/* Newsletter Banner */}
      <div className="relative w-full bg-[#255DD0] overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Stay ahead of the curve
            </h2>
            <p className="text-sm sm:text-base text-blue-100 mt-2 max-w-xl">
              Subscribe to get notified about product launches, exclusive
              deals, and technology news.
            </p>
          </div>

          <form className="flex w-full flex-col gap-3 xs:flex-row lg:w-auto lg:min-w-105" onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded-lg px-4 py-3 text-sm sm:text-base bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#255DD0] transition hover:bg-blue-50 whitespace-nowrap sm:text-base xs:w-auto"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Footer Links */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {/* Brand */}
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#255DD0]">
                ELECTRA
              </h3>
              <p className="text-sm text-gray-500 mt-3 max-w-xs leading-relaxed">
                Precision electronics for the modern professional. Elevate
                your workflow with cutting-edge technology.
              </p>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="mb-3 text-sm font-semibold text-gray-900 sm:mb-4">
                  {heading}
                </h4>

                <ul className="flex flex-col gap-2 sm:gap-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-sm text-gray-500 transition hover:text-[#255DD0]"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
            <p className="text-xs sm:text-sm text-gray-500 text-center">
              © 2024 ELECTRA Precision Electronics. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
