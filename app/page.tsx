"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // still checking auth
    if (session?.user) {
      router.push("/form"); // logged in → go to form
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e6f7f9] via-white to-[#eaf4ff]">
      <nav className="container flex items-center justify-between py-4">
        <div className="text-2xl font-extrabold tracking-tight text-[#0b6b6f]">Oren</div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/login")} className="btn-secondary">Login</button>
          <button onClick={() => router.push("/signup")} className="btn-primary">Request a Demo</button>
        </div>
      </nav>

      <section className="container grid md:grid-cols-2 gap-8 py-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-[#0b6b6f]">
            All Your Sustainability Data and Stakeholders Connected in One Place
          </h1>
          <p className="mt-4 text-gray-700 max-w-xl">
            Capture ESG metrics across years, track progress in real-time, and export polished reports.
          </p>
          <div className="mt-6 flex gap-3">
            <button onClick={()=>router.push("/signup")} className="btn-primary">Get Started</button>
            <button onClick={()=>router.push("/login")} className="btn-secondary">Sign In</button>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-teal-50">
              <p className="text-xs text-gray-500">Carbon Intensity</p>
              <p className="text-2xl font-semibold text-[#0b6b6f]">0.123</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50">
              <p className="text-xs text-gray-500">Renewable %</p>
              <p className="text-2xl font-semibold text-[#0b6b6f]">64.2%</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-50">
              <p className="text-xs text-gray-500">Diversity %</p>
              <p className="text-2xl font-semibold text-[#0b6b6f]">42.0%</p>
            </div>
            <div className="p-3 rounded-lg bg-sky-50">
              <p className="text-xs text-gray-500">Community %</p>
              <p className="text-2xl font-semibold text-[#0b6b6f]">1.3%</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
