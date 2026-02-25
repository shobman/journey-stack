import { createBrowserRouter, Outlet } from "react-router-dom";
import { JourneyProvider } from "journey-stack";
import { SyncContext } from "./hooks/SyncContext";
import { useRouterJourneySync } from "./hooks/useRouterJourneySync";
import { TopNav } from "./components/TopNav";
import { WorkspaceTabBar } from "./components/WorkspaceTabBar";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { SideNav } from "./components/SideNav";
import { Dashboard } from "./pages/Dashboard";
import { DeviceList } from "./pages/DeviceList";
import { DeviceDetail } from "./pages/DeviceDetail";
import { ServiceList } from "./pages/ServiceList";
import { ServiceDetail } from "./pages/ServiceDetail";
import { CompanyList } from "./pages/CompanyList";
import { CompanyDetail } from "./pages/CompanyDetail";
import { ReportList } from "./pages/ReportList";
import { ReportDetail } from "./pages/ReportDetail";

function RootLayout() {
  return (
    <JourneyProvider
      mode="workspaces"
      domains={["companies", "reports"]}
      homePath="/dashboard"
      homeLabel="Dashboard"
    >
      <SyncBridge>
        <AppShell />
      </SyncBridge>
    </JourneyProvider>
  );
}

function SyncBridge({ children }: { children: React.ReactNode }) {
  const syncValue = useRouterJourneySync();
  return (
    <SyncContext.Provider value={syncValue}>
      {children}
    </SyncContext.Provider>
  );
}

function AppShell() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#f1f5f9",
      }}
    >
      <TopNav />
      <WorkspaceTabBar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <SideNav />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Breadcrumbs />
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "devices", element: <DeviceList /> },
        { path: "devices/:id", element: <DeviceDetail /> },
        { path: "services", element: <ServiceList /> },
        { path: "services/:id", element: <ServiceDetail /> },
        { path: "companies", element: <CompanyList /> },
        { path: "companies/:id", element: <CompanyDetail /> },
        { path: "reports", element: <ReportList /> },
        { path: "reports/:id", element: <ReportDetail /> },
      ],
    },
  ],
  { basename: "/journey-stack" },
);
