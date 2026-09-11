import {
  LayoutDashboard,
  PlusCircle,
  FolderClock,
  FileHeart,
  UserCircle,
  Users,
  ClipboardList,
  FileText,
  Activity,
  UserPlus,
  HeartPulse,
  Monitor,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { ROLES } from "./roles";

/**
 * Role-specific navigation menus.
 * Each navigation item contains:
 * - label: text display name
 * - path: route link
 * - icon: Lucide React icon component
 * - badge?: optional badge or indicator
 */
export const ROLE_NAVIGATION = Object.freeze({
  [ROLES.PATIENT]: [
    {
      label: "Dashboard",
      path: "/patient/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "New Case",
      path: "/patient/new-case",
      icon: PlusCircle,
    },
    {
      label: "Case History",
      path: "/patient/case-history",
      icon: FolderClock,
    },
    {
      label: "Medical History",
      path: "/patient/medical-history",
      icon: FileHeart,
    },
    {
      label: "My Profile",
      path: "/patient/profile",
      icon: UserCircle,
    },
  ],
  [ROLES.DOCTOR]: [
    {
      label: "Dashboard",
      path: "/doctor/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Patient Records",
      path: "/doctor/patients",
      icon: ClipboardList,
    },
    {
      label: "My Profile",
      path: "/doctor/profile",
      icon: UserCircle,
    },
  ],
  [ROLES.KIOSK]: [
    {
      label: "Intake Station",
      path: "/kiosk/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "New Registration",
      path: "/kiosk/register",
      icon: UserPlus,
    },
    {
      label: "Vitals Check",
      path: "/kiosk/vitals",
      icon: Activity,
    },
  ],
  [ROLES.TRIAGE_NURSE]: [
    {
      label: "Triage Dashboard",
      path: "/triage_nurse/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Triage Queue",
      path: "/triage_nurse/queue",
      icon: Users,
    },
    {
      label: "Vitals Assessment",
      path: "/triage_nurse/vitals",
      icon: HeartPulse,
    },
  ],
  [ROLES.ADMIN]: [
    {
      label: "Admin Overview",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Kiosk Terminals",
      path: "/admin/kiosks",
      icon: Monitor,
    },
    {
      label: "Audit & Security",
      path: "/admin/audit",
      icon: ShieldCheck,
    },
    {
      label: "System Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ],
});

/**
 * Returns the navigation items for the given user role.
 */
export function getNavigationForRole(role) {
  return ROLE_NAVIGATION[role] || ROLE_NAVIGATION[ROLES.PATIENT] || [];
}
