import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  HeartPulse,
  User,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNavigationForRole } from "../constants/navigation";
import { ROLE_LABELS } from "../constants/roles";
import { LanguageSelector } from "./LanguageSelector";
import { TranslatedText } from "./common/TranslatedText";

/**
 * Reusable, responsive dashboard navigation layout.
 *
 * Props:
 * - navItems: Array of { label, path, icon: LucideIcon, onClick, badge }
 * - user: User details override { fullName, name, email, phone, mobile, role }
 * - onLogout: Optional custom sign-out callback
 * - brand: Optional custom branding React element
 * - sidebarFooter: Optional custom React element rendered at the bottom of the sidebar
 * - title: Optional current page / area title shown in top bar
 * - children: Main content to render inside the responsive container
 */
export function DashboardLayout({
  navItems: customNavItems,
  user: customUser,
  onLogout,
  brand,
  sidebarFooter,
  title,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  // Resolved user session (prop takes precedence over auth context)
  const activeUser = customUser || auth?.user;
  const role = activeUser?.role || "patient";
  const roleLabel = ROLE_LABELS[role] || role;

  // Derive display values for user profile in top bar
  const person =
    activeUser?.patient ||
    activeUser?.profiles?.[0] ||
    activeUser?.user ||
    activeUser ||
    {};

  const userName =
    (typeof person.demographics?.fullName === "string" && person.demographics.fullName) ||
    (typeof person.fullName === "string" && person.fullName) ||
    (typeof person.name === "string" && person.name) ||
    (typeof activeUser?.fullName === "string" && activeUser.fullName) ||
    (typeof activeUser?.name === "string" && activeUser.name) ||
    "User";

  const userContact =
    (typeof person.demographics?.phone === "string" && person.demographics.phone) ||
    (typeof person.phone === "string" && person.phone) ||
    (typeof person.mobile === "string" && person.mobile) ||
    (typeof person.email === "string" && person.email) ||
    (typeof activeUser?.phone === "string" && activeUser.phone) ||
    (typeof activeUser?.email === "string" && activeUser.email) ||
    `${roleLabel} Session`;

  // Resolved navigation items (prop takes precedence over role-based default)
  const navItems = customNavItems || getNavigationForRole(role);

  // Close drawer on route change or ESC key
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = useCallback(async () => {
    if (typeof onLogout === "function") {
      onLogout();
    } else if (auth?.logout) {
      await auth.logout();
      navigate("/login");
    }
  }, [onLogout, auth, navigate]);

  const closeDrawer = useCallback(() => {
    setMobileOpen(false);
  }, []);

  /**
   * Helper to check if a navigation route is active.
   */
  const isItemActive = (itemPath) => {
    if (!itemPath) return false;
    if (itemPath === `/patient/dashboard` || itemPath.endsWith("/dashboard")) {
      return location.pathname === itemPath;
    }
    return location.pathname.startsWith(itemPath);
  };

  // Shared Sidebar Content (used in desktop and mobile drawer)
  const renderSidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand / Logo Area */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          {brand ? (
            brand
          ) : (
            <Link
              to={navItems[0]?.path || "/"}
              onClick={isMobile ? closeDrawer : undefined}
              className="flex items-center gap-3 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0c5e5b] rounded-lg p-1"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#0c5e5b] text-white shadow-xs">
                <HeartPulse className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[#0c5e5b]">
                  MediKiosk
                </span>
                <span className="text-[0.65rem] font-medium uppercase tracking-wider text-gray-400">
                  {roleLabel} Portal
                </span>
              </div>
            </Link>
          )}

          {/* Close button for mobile drawer */}
          {isMobile && (
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0c5e5b] cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Vertical Navigation Menu */}
        <nav
          className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]"
          aria-label="Sidebar navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);

            const commonClasses = `group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0c5e5b] cursor-pointer ${
              active
                ? "bg-[#e2f2ef] text-[#0c5e5b] font-semibold shadow-2xs"
                : "text-gray-600 hover:bg-[#f4f9f7] hover:text-gray-900"
            }`;

            const itemContent = (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <Icon
                      className={`size-5 shrink-0 transition-colors ${
                        active
                          ? "text-[#0c5e5b]"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <span className="truncate">
                    <TranslatedText text={item.label} />
                  </span>
                </div>
                {item.badge && (
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      active
                        ? "bg-[#0c5e5b] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            );

            if (item.path) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={isMobile ? closeDrawer : undefined}
                  className={commonClasses}
                  aria-current={active ? "page" : undefined}
                >
                  {itemContent}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (typeof item.onClick === "function") item.onClick();
                  if (isMobile) closeDrawer();
                }}
                className={commonClasses}
              >
                {itemContent}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer (Optional custom slot or account switch) */}
      <div className="border-t border-gray-100 p-3">
        {sidebarFooter ? (
          sidebarFooter
        ) : (
          <div className="rounded-xl bg-[#f8faf9] p-3 text-xs text-gray-500 flex items-center justify-between">
            <div className="truncate">
              <span className="block font-medium text-gray-700 truncate">
                {roleLabel} Console
              </span>
              <span className="text-[0.7rem] text-gray-400">v1.2.0 • Secured</span>
            </div>
            {role === "patient" && (
              <Link
                to="/profiles"
                onClick={isMobile ? closeDrawer : undefined}
                className="text-[#0c5e5b] font-semibold hover:underline flex items-center text-[0.72rem] shrink-0"
              >
                Switch
                <ChevronRight className="size-3 ml-0.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f9f7] text-[#143337] antialiased">
      {/* ========================================================
          1. Desktop Fixed Sidebar (w-64 = 256px, clean white background)
         ======================================================== */}
      <aside
        className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-gray-200 bg-white z-30 lg:flex"
        aria-label="Desktop Sidebar"
      >
        {renderSidebarContent(false)}
      </aside>

      {/* ========================================================
          2. Mobile Sidebar Drawer + Backdrop
         ======================================================== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation drawer"
      >
        {renderSidebarContent(true)}
      </div>

      {/* ========================================================
          3. Main Content Wrapper (offset on desktop by sidebar: lg:pl-64)
         ======================================================== */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          {/* Left section: mobile hamburger & MediKiosk branding */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0c5e5b] lg:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>

            {/* MediKiosk branding in top bar */}
            <Link
              to={navItems[0]?.path || "/"}
              className="flex items-center gap-2 text-left"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#0c5e5b] text-white shadow-2xs">
                <HeartPulse className="size-4" />
              </span>
              <span className="text-base font-bold tracking-tight text-[#0c5e5b]">
                MediKiosk
              </span>
              {title && (
                <>
                  <span className="text-gray-300 font-light">/</span>
                  <span className="text-sm font-semibold text-gray-700 hidden sm:inline-block">
                    <TranslatedText text={title} />
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Right section: Language selector, User / Account section & Logout icon button */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Language Selector next to profile */}
            <LanguageSelector />

            {/* User details */}
            <div className="flex items-center gap-2.5 text-right">
              <div className="hidden sm:flex flex-col text-right max-w-[180px]">
                <span className="truncate text-xs font-semibold text-gray-900 leading-tight">
                  {userName}
                </span>
                <span className="truncate text-[0.7rem] text-gray-500 leading-tight">
                  {userContact}
                </span>
              </div>
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e2f2ef] text-[#0c5e5b] font-bold text-xs"
                title={typeof userName === "string" ? userName : "User"}
              >
                {typeof userName === "string" && userName.trim().length > 0 ? (
                  userName.trim().charAt(0).toUpperCase()
                ) : (
                  <User className="size-4" />
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

            {/* Logout icon-only button with accessible tooltip and aria-label */}
            <button
              type="button"
              onClick={handleLogout}
              className="group flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 transition-colors cursor-pointer"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="size-4.5 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </header>

        {/* Page Content inside responsive centered container */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
