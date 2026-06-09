import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, Upload, Users, User, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser } from "@/mocks/data";

const navItems = [
    { to: "/", label: "Scrapbook", icon: LayoutGrid },
    { to: "/upload", label: "Upload", icon: Upload },
    { to: "/pair", label: "Pair", icon: Users },
    { to: "/profile", label: "Profile", icon: User },
];

export function AppLayout() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity"
                    >
                        <Heart className="h-7 w-7" />
                        <span>Our Scrapbook</span>
                    </button>
                    <nav className="flex items-center gap-1">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-foreground hover:bg-muted"
                                    }`
                                }
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>
                    <Avatar
                        className="h-9 w-9 cursor-pointer"
                        onClick={() => navigate("/profile")}
                    >
                        <AvatarImage src={currentUser.avatarUrl} />
                        <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-8">
                <Outlet />
            </main>
            <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
                © 2026 Our Scrapbook · Built with love on Azure
            </footer>
        </div>
    );
}
