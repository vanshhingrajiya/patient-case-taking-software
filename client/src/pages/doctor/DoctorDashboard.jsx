import {
  Activity,
  AlertTriangle,
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { apiClient } from "../../services/api.client";

// Custom hook for count-up animation
function useCountUp(endValue, duration = 1500) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Start animation only when endValue is a valid number
    const end = parseInt(endValue, 10);
    if (isNaN(end)) {
      setCount(endValue);
      return;
    }

    setHasStarted(true);
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Use easeOutQuart easing function for smoother animation
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    window.requestAnimationFrame(step);
  }, [endValue, duration]);

  return hasStarted && !isNaN(parseInt(endValue, 10)) ? count : endValue;
}

export function DoctorDashboard() {
  const [stats, setStats] = useState({
    patientCount: "...",
    aiFlaggedCount: "...",
    abnormalReportsCount: "...",
  });
  const [casesCount, setCasesCount] = useState("...");

  useEffect(() => {
    // Number of cases (fetch from local storage)
    const storedCases = localStorage.getItem("casesCount");
    setCasesCount(storedCases ? storedCases : "15");

    // Dynamic stats from backend API
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/dashboard/doctor-stats');
        if (response?.data) {
          setStats({
            patientCount: response.data.patientCount,
            aiFlaggedCount: response.data.aiFlaggedCount,
            abnormalReportsCount: response.data.abnormalReportsCount,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        // Fallback to dummies if backend fails or route is unprotected
        setStats({
          patientCount: "42",
          aiFlaggedCount: "5",
          abnormalReportsCount: "3",
        });
      }
    };

    fetchStats();
  }, []);

  const animatedPatientCount = useCountUp(stats.patientCount);
  const animatedCasesCount = useCountUp(casesCount);
  const animatedAiFlagged = useCountUp(stats.aiFlaggedCount);
  const animatedAbnormal = useCountUp(stats.abnormalReportsCount);

  const metrics = [
    {
      label: "Numbers of patients",
      value: animatedPatientCount,
      detail: "Updated dynamically",
      icon: Users,
    },
    {
      label: "Number of cases",
      value: animatedCasesCount,
      detail: "From local storage",
      icon: FileText,
    },
    {
      label: "AI-Flagged Cases",
      value: animatedAiFlagged,
      detail: "Needs attention",
      icon: ClipboardList,
    },
    {
      label: "Abnormal Reports",
      value: animatedAbnormal,
      detail: "Review required",
      icon: AlertTriangle,
    },
  ];

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="space-y-6">
        <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-2xs sm:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0c5e5b]">
                Clinical overview
              </p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Good morning, Dr. Mehta</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, detail, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#e2f2ef] text-[#0c5e5b]">
                  <Icon className="size-5" />
                </div>
              </div>
              <div className="mt-5 text-3xl font-bold text-gray-900">{value}</div>
              <p className="mt-2 text-xs text-gray-500">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DoctorDashboard;
