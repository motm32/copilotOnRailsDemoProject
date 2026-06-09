import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import Login from "@/pages/Login";
import Scrapbook from "@/pages/Scrapbook";
import UploadPage from "@/pages/Upload";
import Pair from "@/pages/Pair";
import Profile from "@/pages/Profile";

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Outlet />
    </div>
  );
}

function PublicRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Scrapbook />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/pair" element={<Pair />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
