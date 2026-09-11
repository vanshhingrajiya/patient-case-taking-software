import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ROLES, getRoleDashboardPath } from "./constants/roles";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleProtectedRoute } from "./routes/RoleProtectedRoute";
import { PublicRoute } from "./routes/PublicRoute";

// Common Public & Auth Pages (outside role folders)
import { Welcome } from "./pages/Welcome";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profiles } from "./pages/Profiles";
import { NotFound } from "./pages/NotFound";
import { UnderConstruction } from "./pages/UnderConstruction";

// Role-Specific Pages (organized by role folder)
// 1. Patient Pages
import { PatientDashboard } from "./pages/patient/PatientDashboard";
import { PatientProfile } from "./pages/patient/PatientProfile";
import { MedicalHistory } from "./pages/patient/MedicalHistory";
import { NewCase } from "./pages/patient/NewCase";
import { CaseHistory } from "./pages/patient/CaseHistory";

// 2. Doctor Pages
import { DoctorDashboard } from "./pages/doctor/DoctorDashboard";
import { DoctorPatientRecords } from "./pages/doctor/DoctorPatientRecords";
import { DoctorProfile } from "./pages/doctor/DoctorProfile";

// 3. Kiosk Pages
import { KioskDashboard } from "./pages/kiosk/KioskDashboard";

// 4. Triage Nurse Pages
import { TriageDashboard } from "./pages/triage_nurse/TriageDashboard";

// 5. Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";

/**
 * Redirects authenticated user to their role-specific dashboard.
 */
function DashboardRedirect() {
  const { user } = useAuth();
  const targetPath = getRoleDashboardPath(user?.role);
  return <Navigate to={targetPath} replace />;
}

/**
 * Handles legacy /dashboard/:role links and forwards to canonical routes.
 */
function LegacyRoleRedirect() {
  const { role } = useParams();
  if (role === ROLES.PATIENT) {
    return <Navigate to="/patient/dashboard" replace />;
  }
  return <Navigate to={`/${role}/dashboard`} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Welcome />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes (Authentication Required) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/dashboard/:role" element={<LegacyRoleRedirect />} />
      </Route>

      {/* Role-Protected Routes: Patient Only (/patient/*) */}
      <Route element={<RoleProtectedRoute allowedRoles={[ROLES.PATIENT]} />}>
        <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/medical-history" element={<MedicalHistory />} />
        <Route path="/patient/new-case" element={<NewCase />} />
        <Route path="/patient/case-history" element={<CaseHistory />} />
        <Route path="/patient/cases" element={<Navigate to="/patient/case-history" replace />} />
        <Route
          path="/patient/*"
          element={
            <UnderConstruction
              title="Patient Feature Under Construction"
              description="This patient service is currently being prepared and will be available shortly."
            />
          }
        />
      </Route>

      {/* Role-Protected Routes: Doctor Only (/doctor/*) */}
      <Route element={<RoleProtectedRoute allowedRoles={[ROLES.DOCTOR]} />}>
        <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route
          path="/doctor/queue"
          element={
            <UnderConstruction
              title="Consultation Queue"
              description="The live OPD consultation queue module is currently being finalized."
              moduleName="DOCTOR / QUEUE"
            />
          }
        />
        <Route path="/doctor/patients" element={<DoctorPatientRecords />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route
          path="/doctor/prescriptions"
          element={
            <UnderConstruction
              title="Electronic Prescriptions"
              description="Digital prescription generator and drug formulary dictionary are coming soon."
              moduleName="DOCTOR / PRESCRIPTIONS"
            />
          }
        />
        <Route
          path="/doctor/*"
          element={
            <UnderConstruction
              title="Doctor Module Under Construction"
              description="This physician module is currently under development."
            />
          }
        />
      </Route>

      {/* Role-Protected Routes: Admin Only (/admin/*) */}
      <Route element={<RoleProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route
          path="/admin/users"
          element={
            <UnderConstruction
              title="User & Staff Management"
              description="Staff role assignment and credential management module is in progress."
              moduleName="ADMIN / USERS"
            />
          }
        />
        <Route
          path="/admin/kiosks"
          element={
            <UnderConstruction
              title="Kiosk Terminals Monitoring"
              description="Remote kiosk telemetry and health monitor interface is under construction."
              moduleName="ADMIN / KIOSKS"
            />
          }
        />
        <Route
          path="/admin/audit"
          element={
            <UnderConstruction
              title="Audit & Compliance Logs"
              description="Security audit trails and access logging viewer is in progress."
              moduleName="ADMIN / AUDIT"
            />
          }
        />
        <Route
          path="/admin/settings"
          element={
            <UnderConstruction
              title="System Settings"
              description="ABDM gateway configurations and SMS gateway credentials editor is in progress."
              moduleName="ADMIN / SETTINGS"
            />
          }
        />
        <Route
          path="/admin/*"
          element={
            <UnderConstruction
              title="Admin Module Under Construction"
              description="This administrative panel is currently being developed."
            />
          }
        />
      </Route>

      {/* Role-Protected Routes: Triage Nurse Only (/triage_nurse/*) */}
      <Route element={<RoleProtectedRoute allowedRoles={[ROLES.TRIAGE_NURSE]} />}>
        <Route path="/triage_nurse" element={<Navigate to="/triage_nurse/dashboard" replace />} />
        <Route path="/triage_nurse/dashboard" element={<TriageDashboard />} />
        <Route
          path="/triage_nurse/queue"
          element={
            <UnderConstruction
              title="Triage Queue"
              description="Emergency and OPD intake triage queue is under development."
              moduleName="TRIAGE / QUEUE"
            />
          }
        />
        <Route
          path="/triage_nurse/vitals"
          element={
            <UnderConstruction
              title="Vitals Assessment Station"
              description="Vital signs recording module and automated acuity calculation is in progress."
              moduleName="TRIAGE / VITALS"
            />
          }
        />
        <Route
          path="/triage_nurse/*"
          element={
            <UnderConstruction
              title="Triage Nurse Module Under Construction"
              description="This triage module is currently under development."
            />
          }
        />
      </Route>

      {/* Role-Protected Routes: Kiosk Only (/kiosk/*) */}
      <Route element={<RoleProtectedRoute allowedRoles={[ROLES.KIOSK]} />}>
        <Route path="/kiosk" element={<Navigate to="/kiosk/dashboard" replace />} />
        <Route path="/kiosk/dashboard" element={<KioskDashboard />} />
        <Route
          path="/kiosk/register"
          element={
            <UnderConstruction
              title="Kiosk Patient Registration"
              description="ABHA creation and kiosk biometric intake flow is in development."
              moduleName="KIOSK / REGISTER"
            />
          }
        />
        <Route
          path="/kiosk/vitals"
          element={
            <UnderConstruction
              title="Kiosk Automated Screening"
              description="Hardware sensor integration and screening flow is under construction."
              moduleName="KIOSK / VITALS"
            />
          }
        />
        <Route
          path="/kiosk/*"
          element={
            <UnderConstruction
              title="Kiosk Module Under Construction"
              description="This kiosk intake flow is currently under development."
            />
          }
        />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
