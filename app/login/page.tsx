"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res?.ok) {
      window.location.href = "/form";
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md border rounded-2xl p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-3xl font-extrabold tracking-tight text-[#0b6b6f]">Oren</div>
          <h1 className="text-xl font-semibold mt-2">Welcome back</h1>
          <p className="text-gray-600 text-sm">Sign in to continue to your ESG dashboard.</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm p-2 rounded mb-3">{error}</div>}

        <label className="text-sm text-gray-600">Email</label>
        <input name="email" placeholder="you@company.com" onChange={handleChange} />
        <label className="text-sm text-gray-600 mt-2">Password</label>
        <input type="password" name="password" placeholder="••••••••" onChange={handleChange} />

        <button disabled={loading} onClick={handleSubmit} className="btn-primary w-full mt-4">
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-sm text-gray-600 text-center mt-4">
          Don’t have an account? <Link href="/signup" className="text-[#0b6b6f] font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
