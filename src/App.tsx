import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthenticatedRoute, UnauthenticatedRoute } from "./components/auth/AuthWrapper";
import { DriverRoute } from "./components/auth/DriverRoute";
import Layout from "./components/layout/Layout";
import MapView from "./pages/MapView";
import BusRegistration from "./pages/BusRegistration";
import Messaging from "./pages/Messaging";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./providers/ThemeProvider";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserStops from "./pages/UserStops";
import DriverDashboard from "./pages/DriverDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <UnauthenticatedRoute>
                <Login />
              </UnauthenticatedRoute>
            } />
            <Route path="/login/factor-one" element={
              <UnauthenticatedRoute>
                <Login />
              </UnauthenticatedRoute>
            } />
            <Route path="/signup" element={
              <UnauthenticatedRoute>
                <Signup />
              </UnauthenticatedRoute>
            } />
            <Route path="/signup/verify-email-address" element={
              <UnauthenticatedRoute>
                <Signup />
              </UnauthenticatedRoute>
            } />
            
            <Route path="/driver" element={
              <DriverRoute>
                <DriverDashboard />
              </DriverRoute>
            } />
            <Route path="/" element={
              <AuthenticatedRoute>
                <Layout />
              </AuthenticatedRoute>
            }>
              <Route index element={<MapView />} />
              <Route path="register" element={<BusRegistration />} />
              <Route path="messages" element={<Messaging />} />
              <Route path="settings" element={<Settings />} />
              <Route path="my-stops" element={<UserStops />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
