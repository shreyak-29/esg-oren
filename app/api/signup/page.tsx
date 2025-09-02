"use client";
import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Signup successful! Please login.");
      window.location.href = "/login";
    } else {
      alert("Signup failed. Try another email.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Signup</h1>
      <input name="name" placeholder="Name" onChange={handleChange} className="border p-2 w-full mt-2" />
      <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full mt-2" />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} className="border p-2 w-full mt-2" />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 mt-3 w-full">Signup</button>
    </div>
  );
}
