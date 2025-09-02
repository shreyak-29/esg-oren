"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Row = {
  year: string;
  electricity: number | "";
  renewable: number | "";
  fuel: number | "";
  emissions: number | "";
  employees: number | "";
  femaleEmployees: number | "";
  trainingHours: number | "";
  communitySpend: number | "";
  boardPercent: number | "";
  privacyPolicy: "Yes" | "No";
  revenue: number | "";
};

const emptyRow: Row = {
  year: "",
  electricity: "",
  renewable: "",
  fuel: "",
  emissions: "",
  employees: "",
  femaleEmployees: "",
  trainingHours: "",
  communitySpend: "",
  boardPercent: "",
  privacyPolicy: "No",
  revenue: "",
};

export default function FormPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([emptyRow]);

  // Only redirect after auth status is known
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const autos = useMemo(() =>
    rows.map((r) => ({
      carbonIntensity: r.revenue && r.emissions ? r.emissions / r.revenue : 0,
      renewableRatio: r.electricity && r.renewable ? (r.renewable / r.electricity) * 100 : 0,
      diversityRatio: r.employees && r.femaleEmployees ? (r.femaleEmployees / r.employees) * 100 : 0,
      communitySpendRatio: r.revenue && r.communitySpend ? (r.communitySpend / r.revenue) * 100 : 0,
    })),
  [rows]);

  const update = (index: number, name: keyof Row, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      const isNumberField: Array<keyof Row> = [
        "electricity","renewable","fuel","emissions","employees","femaleEmployees","trainingHours","communitySpend","boardPercent","revenue"
      ];
      // @ts-expect-error narrow later
      next[index][name] = isNumberField.includes(name) ? (value === "" ? "" : Number(value)) : (value as any);
      return next;
    });
  };

  const addYear = () => setRows((r) => [...r, { ...emptyRow }]);
  const removeYear = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    const res = await fetch("/api/auth/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
    if (res.ok) {
      router.push("/summary");
    } else {
      alert("Failed to save. Please try again.");
    }
  };

  if (status === "loading") {
    return <div className="container py-12">Checking session…</div>;
  }
  

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-[#0b6b6f]">Oren</span>
            <span className="text-sm text-gray-500">ESG Questionnaire</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-600" onClick={()=>router.push("/summary")}>Summary</button>
            <button className="btn-secondary" onClick={()=>signOut({ callbackUrl: "/" })}>Logout</button>
          </div>
        </div>
      </header>

      <main className="container">
        <h1 className="text-3xl text-black font-semibold mb-2">All your sustainability data in one place</h1>
        <p className="text-gray-600 mb-6">Fill inputs for multiple financial years. Metrics update in real-time.</p>

        {rows.map((row, idx) => (
          <section key={idx} className="border rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl text-black font-semibold">Financial Year</h2>
              <div className="flex items-center gap-2">
                <button className="btn-secondary" onClick={addYear}>Add Year</button>
                {rows.length > 1 && (
                  <button className="bg-red-500 text-white" onClick={()=>removeYear(idx)}>Remove</button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">Financial Year</label>
                <input value={row.year} name="year" placeholder="FY 2023-24" onChange={(e)=>update(idx, "year", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Total electricity consumption (kWh)</label>
                <input type="number" value={row.electricity} placeholder="0" onChange={(e)=>update(idx, "electricity", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Renewable electricity consumption (kWh)</label>
                <input type="number" value={row.renewable} placeholder="0" onChange={(e)=>update(idx, "renewable", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Total fuel consumption (liters)</label>
                <input type="number" value={row.fuel} placeholder="0" onChange={(e)=>update(idx, "fuel", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Carbon emissions (T CO2e)</label>
                <input type="number" value={row.emissions} placeholder="0" onChange={(e)=>update(idx, "emissions", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Total number of employees</label>
                <input type="number" value={row.employees} placeholder="0" onChange={(e)=>update(idx, "employees", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Number of female employees</label>
                <input type="number" value={row.femaleEmployees} placeholder="0" onChange={(e)=>update(idx, "femaleEmployees", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Average training hours per employee (per year)</label>
                <input type="number" value={row.trainingHours} placeholder="0" onChange={(e)=>update(idx, "trainingHours", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Community investment spend (INR)</label>
                <input type="number" value={row.communitySpend} placeholder="0" onChange={(e)=>update(idx, "communitySpend", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">% of independent board members</label>
                <input type="number" value={row.boardPercent} placeholder="0" onChange={(e)=>update(idx, "boardPercent", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Data privacy policy</label>
                <select value={row.privacyPolicy} onChange={(e)=>update(idx, "privacyPolicy", e.target.value)}>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Total revenue (INR)</label>
                <input type="number" value={row.revenue} placeholder="0" onChange={(e)=>update(idx, "revenue", e.target.value)} />
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-4 gap-4 bg-teal-50 rounded-xl p-3">
              <MetricCard title="Carbon Intensity" value={autos[idx].carbonIntensity} suffix=" T CO2e / INR" />
              <MetricCard title="Renewable Electricity Ratio" value={autos[idx].renewableRatio} suffix=" %" />
              <MetricCard title="Diversity Ratio" value={autos[idx].diversityRatio} suffix=" %" />
              <MetricCard title="Community Spend Ratio" value={autos[idx].communitySpendRatio} suffix=" %" />
            </div>
          </section>
        ))}

        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={addYear}>Add Financial Year</button>
          <button onClick={handleSubmit} className="bg-[#0b6b6f] text-white">Save & View Summary</button>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, suffix }: { title: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-[#0b6b6f]">{Number.isFinite(value) ? value.toFixed(2) : "0.00"}{suffix}</p>
    </div>
  );
}
