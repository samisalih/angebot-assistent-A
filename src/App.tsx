
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OfferProvider } from "@/contexts/OfferContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Appointment from "./pages/Appointment";
import Offers from "./pages/Offers";
import Profile from "./pages/Profile";
import AuthSuccess from "./pages/AuthSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OfferProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/appointment" element={<Appointment />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OfferProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
