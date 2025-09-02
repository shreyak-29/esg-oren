"use client";
import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = "/login";
    } else {
      setError("Signup failed. Try another email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md border rounded-2xl p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-3xl font-extrabold tracking-tight text-[#0b6b6f]">Oren</div>
          <h1 className="text-xl font-semibold mt-2">Create your account</h1>
          <p className="text-gray-600 text-sm">Start capturing your ESG metrics.</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm p-2 rounded mb-3">{error}</div>}

        <label className="text-sm text-gray-600">Name</label>
        <input name="name" placeholder="Your name" onChange={handleChange} />
        <label className="text-sm text-gray-600 mt-2">Email</label>
        <input name="email" placeholder="you@company.com" onChange={handleChange} />
        <label className="text-sm text-gray-600 mt-2">Password</label>
        <input type="password" name="password" placeholder="Create a password" onChange={handleChange} />

        <button disabled={loading} onClick={handleSubmit} className="btn-primary w-full mt-4">
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-gray-600 text-center mt-4">
          Already have an account? <Link href="/login" className="text-[#0b6b6f] font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
