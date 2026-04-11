import { useEffect } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

import { utpCatalog } from "@/content/utpCatalog";
import { initializeTracking } from "@/lib/utm";
import { queryClientInstance } from "@/lib/query-client";
import { CATALOG_PATH, CRM_PATH } from "@/lib/routes";
import PageNotFound from "@/lib/PageNotFound";
import CatalogPage from "@/pages/CatalogPage";
import CrmPage from "@/pages/CrmPage";
import LandingPage from "@/pages/LandingPage";

function TrackingManager() {
  const location = useLocation();

  useEffect(() => {
    const slug = location.pathname.startsWith("/landing")
      ? location.pathname.slice(1)
      : null;

    initializeTracking(slug);
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TrackingManager />
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path={CATALOG_PATH} element={<CatalogPage />} />
          {utpCatalog.map((landing) => (
            <Route
              key={landing.slug}
              path={`/${landing.slug}`}
              element={<LandingPage landing={landing} />}
            />
          ))}
          <Route path="/crm" element={<CrmPage />} />
          <Route path={CRM_PATH} element={<CrmPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
