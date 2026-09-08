import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Cpu,
  Smartphone,
  ShieldCheck,
  Zap,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-[#F7F8FA]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">

            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#255DD0]">
              About ELECTRA
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              Technology made
              <span className="text-[#255DD0]"> easier to access.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              ELECTRA is an electronics-focused e-commerce platform built to
              make it simple to discover, compare, and purchase the technology
              you need — from everyday electronics to development hardware.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#255DD0] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Explore Products
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 transition hover:border-[#255DD0] hover:text-[#255DD0]"
              >
                Contact Us
              </Link>
            </div>

          </div>
        </div>

        {/* Decorative shapes */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#255DD0]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-20 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
      </section>


      {/* ================= INTRO ================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#255DD0]">
                Who We Are
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Your destination for modern electronics.
              </h2>
            </div>

            <div className="space-y-5 text-base leading-7 text-gray-600">
              <p>
                ELECTRA brings different categories of electronics together
                in one convenient store. Whether you're looking for a mobile
                phone, computer accessory, audio device, camera, microcontroller,
                or development hardware, our goal is to make finding the right
                product straightforward.
              </p>

              <p>
                We believe an electronics store should be more than a catalog
                of products. It should provide a clean shopping experience,
                useful product information, reliable inventory, and an
                organized way to manage everything behind the scenes.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ================= WHAT WE OFFER ================= */}
      <section className="bg-[#F7F8FA]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-[#255DD0]">
              What You Can Find
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-950 sm:text-4xl">
              Electronics for different needs
            </h2>

            <p className="mt-4 text-gray-600">
              From everyday technology to hardware for developers and
              enthusiasts, ELECTRA brings multiple electronics categories
              together.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* Card 1 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#255DD0]">
                <Smartphone size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-950">
                Consumer Electronics
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Smartphones, headphones, cameras, accessories, and other
                everyday electronic devices.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#255DD0]">
                <Cpu size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-950">
                Development Hardware
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Microcontrollers, development boards, sensors, and hardware
                for electronics and embedded projects.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#255DD0]">
                <Zap size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-950">
                Modern Technology
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Technology products designed to improve productivity,
                entertainment, communication, and everyday life.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#255DD0]">
                <ShoppingBag size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-950">
                One Store
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Browse multiple electronics categories from one organized
                e-commerce platform.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ================= WHY ELECTRA ================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#255DD0]">
                Why ELECTRA
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-950 sm:text-4xl">
                Built around a better shopping experience.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-gray-600">
                We focus on keeping the shopping experience simple, organized,
                and useful. From browsing products to managing inventory,
                ELECTRA is designed around the needs of a modern electronics
                store.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-gray-100 p-6">
                <ShieldCheck className="text-[#255DD0]" size={26} />

                <h3 className="mt-4 font-bold text-gray-950">
                  Reliable Information
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Clear product details help customers understand what they
                  are buying.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 p-6">
                <Zap className="text-[#255DD0]" size={26} />

                <h3 className="mt-4 font-bold text-gray-950">
                  Simple Shopping
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Find products, explore categories, and move through the
                  store without unnecessary complexity.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 p-6">
                <Settings className="text-[#255DD0]" size={26} />

                <h3 className="mt-4 font-bold text-gray-950">
                  Organized Store
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Products and categories can be managed through a centralized
                  administration system.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 p-6">
                <Users className="text-[#255DD0]" size={26} />

                <h3 className="mt-4 font-bold text-gray-950">
                  Customer Focused
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Every part of the platform is designed with a straightforward
                  customer experience in mind.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* ================= ADMIN SYSTEM ================= */}
      <section className="bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>
              <span className="inline-flex rounded-full bg-[#255DD0]/20 px-4 py-2 text-sm font-semibold text-blue-300">
                Powerful Store Management
              </span>

              <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
                Everything under control.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-gray-300">
                ELECTRA isn't only designed for customers. Store administrators
                can manage the store from a centralized dashboard, making it
                easier to keep products, categories, and inventory organized.
              </p>

              <div className="mt-8">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#255DD0] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Admin Dashboard
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <Settings className="text-blue-400" size={25} />

                <h3 className="mt-4 font-bold">
                  Product Management
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Add, update, organize, and manage products from one place.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <ShoppingBag className="text-blue-400" size={25} />

                <h3 className="mt-4 font-bold">
                  Category Management
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Keep the store organized by creating and managing product
                  categories.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:col-span-2">
                <Cpu className="text-blue-400" size={25} />

                <h3 className="mt-4 font-bold">
                  A Store That Can Grow
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  As the product catalog grows, the administration system makes
                  it easier to maintain and manage the entire electronics
                  marketplace.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ================= CTA ================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">

          <h2 className="text-3xl font-bold text-gray-950 sm:text-4xl">
            Ready to explore ELECTRA?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
            Explore our electronics collection and find the technology
            that's right for your next project, workspace, or everyday needs.
          </p>

          <div className="mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-[#255DD0] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Products
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default About;