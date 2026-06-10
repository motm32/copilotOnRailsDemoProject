import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ScrapbookPage } from "@/pages/ScrapbookPage";
import { UploadPage } from "@/pages/UploadPage";
import { PairPage } from "@/pages/PairPage";
import { ProfilePage } from "@/pages/ProfilePage";

function RequireAuth({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("auth_token");
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    element={
                        <RequireAuth>
                            <AppLayout />
                        </RequireAuth>
                    }
                >
                    <Route path="/" element={<ScrapbookPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/pair" element={<PairPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
