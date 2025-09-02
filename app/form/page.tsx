"use client";
import { useState, useMemo } from "react";

export default function FormPage() {
  const [form, setForm] = useState({
    year: "",
    electricity: 0,
    renewable: 0,
    fuel: 0,
    emissions: 0,
    employees: 0,
    femaleEmployees: 0,
    trainingHours: 0,
    communitySpend: 0,
    boardPercent: 0,
    privacyPolicy: "No",
    revenue: 0,
  });

  const auto = useMemo(() => {
    const carbonIntensity = form.revenue ? form.emissions / form.revenue : 0;
    const renewableRatio = form.electricity ? (form.renewable / form.electricity) * 100 : 0;
    const diversityRatio = form.employees ? (form.femaleEmployees / form.employees) * 100 : 0;
    const communitySpendRatio = form.revenue ? (form.communitySpend / form.revenue) * 100 : 0;
    return { carbonIntensity, renewableRatio, diversityRatio, communitySpendRatio };
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await fetch("/api/responses", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
    alert("Response saved!");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">ESG Questionnaire</h1>
      <input name="year" placeholder="Financial Year" onChange={handleChange} />
      <input name="electricity" type="number" placeholder="Total Electricity" onChange={handleChange} />
      <input name="renewable" type="number" placeholder="Renewable Electricity" onChange={handleChange} />
      <input name="emissions" type="number" placeholder="Carbon Emissions" onChange={handleChange} />
      <input name="revenue" type="number" placeholder="Total Revenue" onChange={handleChange} />
      {/* add rest of fields similarly */}
      
      <h2 className="mt-4">Auto Calculated</h2>
      <p>Carbon Intensity: {auto.carbonIntensity.toFixed(2)}</p>
      <p>Renewable Ratio: {auto.renewableRatio.toFixed(2)}%</p>
      <p>Diversity Ratio: {auto.diversityRatio.toFixed(2)}%</p>
      <p>Community Spend Ratio: {auto.communitySpendRatio.toFixed(2)}%</p>

      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 mt-3">Save</button>
    </div>
  );
}
