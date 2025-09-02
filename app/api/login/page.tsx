"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.ok) {
      window.location.href = "/form";
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Login</h1>
      <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full mt-2" />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} className="border p-2 w-full mt-2" />
      <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 mt-3 w-full">Login</button>
    </div>
  );
}
