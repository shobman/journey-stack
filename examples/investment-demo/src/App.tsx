import { JourneyProvider, useCurrentStep } from "journey-stack";
import { TopNav } from "./components/TopNav";
import { ChapterTabs } from "./components/ChapterTabs";
import { BackBar } from "./components/BackBar";
import { ClientList } from "./pages/ClientList";
import { ClientDetail } from "./pages/ClientDetail";
import { PortfolioDetail } from "./pages/PortfolioDetail";
import { FundDetail } from "./pages/FundDetail";
import { ResearchDetail } from "./pages/ResearchDetail";
import { ListPage } from "./pages/ListPage";

function PageRouter() {
  const step = useCurrentStep();
  const path = step?.path ?? "/";

  if (path === "/clients" || path === "/") return <ClientList />;
  if (path.startsWith("/clients/")) {
    const id = path.split("/")[2];
    return <ClientDetail id={id} />;
  }
  if (path === "/portfolios") return <ListPage domain="portfolios" />;
  if (path.startsWith("/portfolios/")) {
    const id = path.split("/")[2];
    return <PortfolioDetail id={id} />;
  }
  if (path === "/funds") return <ListPage domain="funds" />;
  if (path.startsWith("/funds/")) {
    const id = path.split("/")[2];
    return <FundDetail id={id} />;
  }
  if (path === "/research") return <ListPage domain="research" />;
  if (path.startsWith("/research/")) {
    const id = path.split("/")[2];
    return <ResearchDetail id={id} />;
  }

  return <ClientList />;
}

export function App() {
  return (
    <JourneyProvider
      mode="chapters"
      domains={["clients", "portfolios", "funds", "research"]}
      homePath="/clients"
      homeLabel="Clients"
    >
      <div className="app">
        <TopNav />
        <ChapterTabs />
        <BackBar />
        <main className="page-content">
          <PageRouter />
        </main>
      </div>
    </JourneyProvider>
  );
}
