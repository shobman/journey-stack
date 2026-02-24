import { JourneyProvider, useCurrentStep, useJourneyBrowserSync } from "journey-stack";
import { TopNav } from "./components/TopNav";
import { ChapterTabBar } from "./components/ChapterTabBar";
import { BackBar } from "./components/BackBar";
import { ContextualSidebar } from "./components/ContextualSidebar";
import { Dashboard } from "./pages/Dashboard";
import { DeviceList } from "./pages/DeviceList";
import { DeviceDetail } from "./pages/DeviceDetail";
import { ServiceList } from "./pages/ServiceList";
import { ServiceDetail } from "./pages/ServiceDetail";
import { CompanyList } from "./pages/CompanyList";
import { CompanyDetail } from "./pages/CompanyDetail";
import { ReportList } from "./pages/ReportList";
import { ReportDetail } from "./pages/ReportDetail";

function PageRouter() {
  const step = useCurrentStep();
  const path = step?.path ?? "/dashboard";

  if (path === "/dashboard" || path === "/") return <Dashboard />;

  if (path === "/devices") return <DeviceList />;
  if (path.startsWith("/devices/"))
    return <DeviceDetail id={path.split("/")[2]} />;

  if (path === "/services") return <ServiceList />;
  if (path.startsWith("/services/"))
    return <ServiceDetail id={path.split("/")[2]} />;

  if (path === "/companies") return <CompanyList />;
  if (path.startsWith("/companies/"))
    return <CompanyDetail id={path.split("/")[2]} />;

  if (path === "/reports") return <ReportList />;
  if (path.startsWith("/reports/"))
    return <ReportDetail id={path.split("/")[2]} />;

  return <Dashboard />;
}

function AppShell() {
  useJourneyBrowserSync();

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
      <ChapterTabBar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <ContextualSidebar />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <BackBar />
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
            <PageRouter />
          </div>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <JourneyProvider
      mode="chapters"
      domains={["dashboard", "companies"]}
      homePath="/dashboard"
      homeLabel="Dashboard"
    >
      <AppShell />
    </JourneyProvider>
  );
}
