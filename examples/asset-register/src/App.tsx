import { JourneyProvider, useActiveChapter, useCurrentStep } from "journey-stack";
import { TopNav } from "./components/TopNav";
import { ChapterTabs } from "./components/ChapterTabs";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { DeviceList } from "./pages/DeviceList";
import { DeviceDetail } from "./pages/DeviceDetail";
import { ServiceList } from "./pages/ServiceList";
import { ServiceDetail } from "./pages/ServiceDetail";
import { CompanyList } from "./pages/CompanyList";
import { CompanyDetail } from "./pages/CompanyDetail";
import { UserDetail } from "./pages/UserDetail";
import { NewAsset } from "./pages/NewAsset";

function PageRouter() {
  const step = useCurrentStep();
  const path = step?.path ?? "/";

  if (path === "/dashboard" || path === "/") return <Dashboard />;

  if (path === "/devices") return <DeviceList />;
  if (path.startsWith("/devices/")) {
    return <DeviceDetail id={path.split("/")[2]} />;
  }

  if (path === "/services") return <ServiceList />;
  if (path.startsWith("/services/")) {
    return <ServiceDetail id={path.split("/")[2]} />;
  }

  if (path === "/companies") return <CompanyList />;
  if (path.startsWith("/companies/")) {
    return <CompanyDetail id={path.split("/")[2]} />;
  }

  if (path.startsWith("/users/")) {
    return <UserDetail id={path.split("/")[2]} />;
  }

  if (path === "/assets/new") return <NewAsset />;

  return <Dashboard />;
}

function MainContent() {
  const chapter = useActiveChapter();
  const domain = chapter?.domain ?? "dashboard";
  const showSidebar = domain !== "assets";

  return (
    <div className="main-layout">
      {showSidebar && <Sidebar domain={domain} />}
      <main className="page-content">
        <PageRouter />
      </main>
    </div>
  );
}

export function App() {
  return (
    <JourneyProvider
      mode="chapters"
      domains={["dashboard", "devices", "services", "companies", "assets"]}
      homePath="/dashboard"
      homeLabel="Dashboard"
    >
      <div className="app">
        <TopNav />
        <ChapterTabs />
        <Breadcrumbs />
        <MainContent />
      </div>
    </JourneyProvider>
  );
}
