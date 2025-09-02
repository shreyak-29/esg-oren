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
    <main className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-black">Welcome to ESG Questionnaire</h1>
      <p className="text-gray-600 mb-8">Track and analyze your ESG metrics easily.</p>
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/login")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/signup")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          Signup
        </button>
      </div>
    </main>
  );
}
