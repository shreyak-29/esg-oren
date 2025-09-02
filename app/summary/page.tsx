"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

type ResponseRow = {
  id: string;
  financialYear: string;
  electricity: number;
  renewable: number;
  fuel: number;
  emissions: number;
  employees: number;
  femaleEmployees: number;
  trainingHours: number;
  communitySpend: number;
  boardPercent: number;
  privacyPolicy: boolean;
  revenue: number;
  createdAt: string;
};

export default function SummaryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ResponseRow[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    if (session === null) {
      router.push("/login");
      return;
    }
    
    // If session exists, fetch data
    if (session?.user) {
      (async () => {
        const res = await fetch("/api/auth/responses");
        if (res.ok) {
          const rows = await res.json();
          setData(rows);
          // Set default selected year to the most recent year
          if (rows.length > 0) {
            setSelectedYear(rows[0].financialYear);
          }
        }
      })();
    }
  }, [session, router]);

  // Filter data based on selected year
  const filteredData = useMemo(() => {
    if (selectedYear === "all") return data;
    return data.filter(row => row.financialYear === selectedYear);
  }, [data, selectedYear]);

  const chartData = useMemo(() => {
    if (selectedYear === "all") {
      // Show all years comparison
      return data.map((r) => ({
        year: r.financialYear,
        carbonIntensity: Number((r.revenue ? r.emissions / r.revenue : 0).toFixed(2)),
        renewableRatio: Number((r.electricity ? (r.renewable / r.electricity) * 100 : 0).toFixed(2)),
        diversityRatio: Number((r.employees ? (r.femaleEmployees / r.employees) * 100 : 0).toFixed(2)),
        communitySpendRatio: Number((r.revenue ? (r.communitySpend / r.revenue) * 100 : 0).toFixed(2)),
      }));
    } else {
      // Show single year detailed breakdown
      const row = filteredData[0];
      if (!row) return [];
      
      return [
        {
          year: row.financialYear,
          carbonIntensity: Number((row.revenue ? row.emissions / row.revenue : 0).toFixed(2)),
          renewableRatio: Number((row.electricity ? (row.renewable / row.electricity) * 100 : 0).toFixed(2)),
          diversityRatio: Number((row.employees ? (row.femaleEmployees / row.employees) * 100 : 0).toFixed(2)),
          communitySpendRatio: Number((row.revenue ? (row.communitySpend / row.revenue) * 100 : 0).toFixed(2))
        }
      ];
    }
  }, [data, selectedYear, filteredData]);

  // Type-safe chart data for different views
  const multiYearData = useMemo(() => {
    if (selectedYear === "all") {
      return chartData as Array<{
        year: string;
        carbonIntensity: number;
        renewableRatio: number;
        diversityRatio: number;
        communitySpendRatio: number;
      }>;
    }
    return [];
  }, [chartData, selectedYear]);

  const singleYearData = useMemo(() => {
    if (selectedYear !== "all") {
      return chartData as Array<{
        year: string;
        carbonIntensity: number;
        renewableRatio: number;
        diversityRatio: number;
        communitySpendRatio: number;
      }>;
    }
    return [];
  }, [chartData, selectedYear]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ESG Summary Report", 14, 18);
    
          if (selectedYear === "all") {
        // Multi-year summary
        doc.setFontSize(12);
        doc.text("Multi-Year Comparison", 14, 28);
        doc.setFontSize(10);
        let y = 38;
        
        multiYearData.forEach((r) => {
          doc.text(`${r.year}:`, 14, y);
          doc.text(`  Carbon Intensity: ${r.carbonIntensity.toFixed(2)} T CO2e/INR`, 20, y + 5);
          doc.text(`  Renewable %: ${r.renewableRatio.toFixed(2)}%`, 20, y + 10);
          doc.text(`  Diversity %: ${r.diversityRatio.toFixed(2)}%`, 20, y + 15);
          doc.text(`  Community %: ${r.communitySpendRatio.toFixed(2)}%`, 20, y + 20);
          y += 30;
        });
    } else {
      // Single year detailed report
      const row = filteredData[0];
      if (row) {
        doc.setFontSize(12);
        doc.text(`Financial Year: ${row.financialYear}`, 14, 28);
        doc.setFontSize(10);
        
        let y = 38;
        doc.text("Input Values:", 14, y);
        y += 8;
        doc.text(`Electricity Consumption: ${row.electricity} kWh`, 20, y);
        y += 5;
        doc.text(`Renewable Electricity: ${row.renewable} kWh`, 20, y);
        y += 5;
        doc.text(`Fuel Consumption: ${row.fuel} liters`, 20, y);
        y += 5;
        doc.text(`Carbon Emissions: ${row.emissions} T CO2e`, 20, y);
        y += 5;
        doc.text(`Total Employees: ${row.employees}`, 20, y);
        y += 5;
        doc.text(`Female Employees: ${row.femaleEmployees}`, 20, y);
        y += 5;
        doc.text(`Training Hours: ${row.trainingHours} hours`, 20, y);
        y += 5;
        doc.text(`Community Spend: ${row.communitySpend} INR`, 20, y);
        y += 5;
        doc.text(`Board Independence: ${row.boardPercent}%`, 20, y);
        y += 5;
        doc.text(`Privacy Policy: ${row.privacyPolicy ? 'Yes' : 'No'}`, 20, y);
        y += 5;
        doc.text(`Revenue: ${row.revenue} INR`, 20, y);
        
        y += 10;
        doc.text("Calculated Metrics:", 14, y);
        y += 8;
                 doc.text(`Carbon Intensity: ${(row.revenue ? row.emissions / row.revenue : 0).toFixed(2)} T CO2e/INR`, 20, y);
        y += 5;
        doc.text(`Renewable Ratio: ${(row.electricity ? (row.renewable / row.electricity) * 100 : 0).toFixed(2)}%`, 20, y);
        y += 5;
        doc.text(`Diversity Ratio: ${(row.employees ? (row.femaleEmployees / row.employees) * 100 : 0).toFixed(2)}%`, 20, y);
        y += 5;
        doc.text(`Community Spend Ratio: ${(row.revenue ? (row.communitySpend / row.revenue) * 100 : 0).toFixed(2)}%`, 20, y);
      }
    }
    
    doc.save(`esg-summary-${selectedYear === "all" ? "multi-year" : selectedYear}.pdf`);
  };

  const downloadExcel = () => {
    let sheetData;
    
    if (selectedYear === "all") {
      // Multi-year summary
      sheetData = multiYearData.map((r) => ({
        Year: r.year,
        "Carbon Intensity (T CO2e/INR)": r.carbonIntensity,
        "Renewable Ratio (%)": r.renewableRatio,
        "Diversity Ratio (%)": r.diversityRatio,
        "Community Spend Ratio (%)": r.communitySpendRatio,
      }));
    } else {
      // Single year detailed data
      const row = filteredData[0];
      if (row) {
        sheetData = [
          {
            "Financial Year": row.financialYear,
            "Electricity (kWh)": row.electricity,
            "Renewable (kWh)": row.renewable,
            "Fuel (liters)": row.fuel,
            "Emissions (T CO2e)": row.emissions,
            "Employees": row.employees,
            "Female Employees": row.femaleEmployees,
            "Training Hours": row.trainingHours,
            "Community Spend (INR)": row.communitySpend,
            "Board Independence (%)": row.boardPercent,
            "Privacy Policy": row.privacyPolicy ? "Yes" : "No",
            "Revenue (INR)": row.revenue,
          },
          {
            "Financial Year": "Calculated Metrics",
            "Carbon Intensity (T CO2e/INR)": row.revenue ? row.emissions / row.revenue : 0,
            "Renewable Ratio (%)": row.electricity ? (row.renewable / row.electricity) * 100 : 0,
            "Diversity Ratio (%)": row.employees ? (row.femaleEmployees / row.employees) * 100 : 0,
            "Community Spend Ratio (%)": row.revenue ? (row.communitySpend / row.revenue) * 100 : 0,
          }
        ];
      }
    }
    
    if (sheetData) {
      const sheet = XLSX.utils.json_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, selectedYear === "all" ? "Multi-Year" : selectedYear);
      XLSX.writeFile(wb, `esg-summary-${selectedYear === "all" ? "multi-year" : selectedYear}.xlsx`);
    }
  };

  // Get unique years for dropdown
  const availableYears = useMemo(() => {
    const years = data.map(row => row.financialYear).filter(Boolean);
    return ["all", ...years];
  }, [data]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b6b6f] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-[#0b6b6f]">Oren</span>
            <span className="text-sm text-gray-500">Summary</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-600" onClick={()=>router.push("/form")}>
              Back to Form
            </button>
            <button className="btn-secondary" onClick={()=>signOut({ callbackUrl: "/" })}>Logout</button>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2 text-black">Summary Dashboard</h1>
            <p className="text-gray-600">
              {selectedYear === "all" 
                ? "Key ESG ratios across all financial years" 
                : `ESG metrics for ${selectedYear}`
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Select Year:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year === "all" ? "All Years" : year}
                </option>
              ))}
            </select>
          </div>
        </div>

                 <div className="rounded-2xl border-2 border-gray-200 p-6 bg-white shadow-lg">
           <div className="h-80 w-full bg-gray-50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={selectedYear === "all" ? multiYearData : singleYearData} barCategoryGap={20} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                 <XAxis dataKey="year" stroke="#374151" fontSize={12} />
                 <YAxis stroke="#374151" fontSize={12} />
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: 'white', 
                     border: '1px solid #d1d5db',
                     borderRadius: '8px',
                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                   }}
                 />
                 <Legend />
                 <Bar dataKey="carbonIntensity" name="Carbon Intensity" fill="#0b6b6f" stroke="#0b6b6f" strokeWidth={2} />
                 <Bar dataKey="renewableRatio" name="Renewable %" fill="#1f9ba8" stroke="#1f9ba8" strokeWidth={2} />
                 <Bar dataKey="diversityRatio" name="Diversity %" fill="#77c5d5" stroke="#77c5d5" strokeWidth={2} />
                 <Bar dataKey="communitySpendRatio" name="Community %" fill="#b6e3f0" stroke="#b6e3f0" strokeWidth={2} />
               </BarChart>
            </ResponsiveContainer>
          </div>

                     {selectedYear !== "all" && filteredData[0] && (
             <div className="mt-6 grid md:grid-cols-2 gap-6">
               <div className="bg-white rounded-lg p-6 border shadow-sm">
                 <h3 className="font-semibold mb-4 text-gray-800 text-lg">Input Values</h3>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Electricity:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].electricity || 0} kWh</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Renewable:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].renewable || 0} kWh</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Fuel:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].fuel || 0} liters</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Emissions:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].emissions || 0} T CO2e</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Employees:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].employees || 0}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Female Employees:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].femaleEmployees || 0}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Training Hours:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].trainingHours || 0} hours</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Community Spend:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].communitySpend || 0} INR</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Board Independence:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].boardPercent || 0}%</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Privacy Policy:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].privacyPolicy ? 'Yes' : 'No'}</span>
                   </div>
                   <div className="flex items-center justify-between py-2">
                     <span className="text-gray-700 font-medium">Revenue:</span>
                     <span className="text-black font-semibold text-lg">{filteredData[0].revenue || 0} INR</span>
                   </div>
                 </div>
               </div>
               
               <div className="bg-white rounded-lg p-6 border shadow-sm">
                 <h3 className="font-semibold mb-4 text-gray-800 text-lg">Calculated Metrics</h3>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Carbon Intensity:</span>
                     <span className="text-black font-semibold text-lg">
                       {filteredData[0].revenue ? (filteredData[0].emissions / filteredData[0].revenue).toFixed(2) : "0.00"} T CO2e/INR
                     </span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Renewable Ratio:</span>
                     <span className="text-black font-semibold text-lg">
                       {filteredData[0].electricity ? ((filteredData[0].renewable / filteredData[0].electricity) * 100).toFixed(2) : "0.00"}%
                     </span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                     <span className="text-gray-700 font-medium">Diversity Ratio:</span>
                     <span className="text-black font-semibold text-lg">
                       {filteredData[0].employees ? ((filteredData[0].femaleEmployees / filteredData[0].employees) * 100).toFixed(2) : "0.00"}%
                     </span>
                   </div>
                   <div className="flex items-center justify-between py-2">
                     <span className="text-gray-700 font-medium">Community Ratio:</span>
                     <span className="text-black font-semibold text-lg">
                       {filteredData[0].revenue ? ((filteredData[0].communitySpend / filteredData[0].revenue) * 100).toFixed(2) : "0.00"}%
                     </span>
                   </div>
                 </div>
               </div>
             </div>
           )}

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={downloadPDF} className="bg-[#0b6b6f] text-white px-4 py-2 rounded-lg">
              Download PDF
            </button>
            <button onClick={downloadExcel} className="btn-secondary">
              Download Excel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

