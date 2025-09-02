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
  emissions: number;
  employees: number;
  femaleEmployees: number;
  communitySpend: number;
  revenue: number;
  createdAt: string;
};

export default function SummaryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ResponseRow[]>([]);

  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    (async () => {
      const res = await fetch("/api/responses");
      if (res.ok) {
        const rows = await res.json();
        setData(rows);
      }
    })();
  }, [session, router]);

  const chartData = useMemo(() =>
    data.map((r) => ({
      year: r.financialYear,
      carbonIntensity: r.revenue ? r.emissions / r.revenue : 0,
      renewableRatio: r.electricity ? (r.renewable / r.electricity) * 100 : 0,
      diversityRatio: r.employees ? (r.femaleEmployees / r.employees) * 100 : 0,
      communitySpendRatio: r.revenue ? (r.communitySpend / r.revenue) * 100 : 0,
    })),
  [data]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("ESG Summary", 14, 18);
    doc.setFontSize(11);
    let y = 28;
    chartData.forEach((r) => {
      doc.text(
        `${r.year} - Carbon Intensity: ${r.carbonIntensity.toFixed(4)}, Renewable %: ${r.renewableRatio.toFixed(2)}, Diversity %: ${r.diversityRatio.toFixed(2)}, Community %: ${r.communitySpendRatio.toFixed(2)}`,
        14,
        y
      );
      y += 8;
    });
    doc.save("esg-summary.pdf");
  };

  const downloadExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(chartData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Summary");
    XLSX.writeFile(wb, "esg-summary.xlsx");
  };

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
        <h1 className="text-3xl font-semibold mb-2">Summary Dashboard</h1>
        <p className="text-gray-600 mb-6">Key ESG ratios per financial year.</p>

        <div className="rounded-2xl border p-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap={20}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="carbonIntensity" name="Carbon Intensity" fill="#0b6b6f" />
                <Bar dataKey="renewableRatio" name="Renewable %" fill="#1f9ba8" />
                <Bar dataKey="diversityRatio" name="Diversity %" fill="#77c5d5" />
                <Bar dataKey="communitySpendRatio" name="Community %" fill="#b6e3f0" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={downloadPDF} className="bg-[#0b6b6f] text-white">Download PDF</button>
            <button onClick={downloadExcel} className="btn-secondary">Download Excel</button>
          </div>
        </div>
      </main>
    </div>
  );
}

