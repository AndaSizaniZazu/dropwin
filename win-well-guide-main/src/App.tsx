import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ProductIntel from "./pages/ProductIntel";
import StoreAudit from "./pages/StoreAudit";
import SpyTools from "./pages/SpyTools";
import SupplierIndex from "./pages/SupplierIndex";
import CROAuditor from "./pages/CROAuditor";
import StoreAIBuilder from "./pages/StoreAIBuilder";
import AliExpressCenter from "./pages/AliExpressCenter";
import AmazonCenter from "./pages/AmazonCenter";
import TemuCenter from "./pages/TemuCenter";
import TakealotCenter from "./pages/TakealotCenter";
import AISearchCenter from "./pages/AISearchCenter";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <div>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/install" element={<Install />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/product-intel" element={<ProductIntel />} />
                <Route path="/aliexpress-center" element={<AliExpressCenter />} />
                <Route path="/amazon-center" element={<AmazonCenter />} />
                <Route path="/temu-center" element={<TemuCenter />} />
                <Route path="/takealot-center" element={<TakealotCenter />} />
                <Route path="/ai-search" element={<AISearchCenter />} />
                <Route path="/store-audit" element={<StoreAudit />} />
                <Route path="/store-ai-builder" element={<StoreAIBuilder />} />
                <Route path="/spy-tools" element={<SpyTools />} />
                <Route path="/supplier-index" element={<SupplierIndex />} />
                <Route path="/cro-auditor" element={<CROAuditor />} />
                <Route path="/account" element={<Account />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
