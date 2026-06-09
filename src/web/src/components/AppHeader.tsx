import { Link, useLocation } from "react-router-dom";
import { Heart, LayoutGrid, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Scrapbook", icon: LayoutGrid },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/pair", label: "Pair", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppHeader() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <Heart className="size-5 fill-primary" />
          <span className="text-lg">OurScrapbook</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Button
              key={to}
              variant="ghost"
              size="sm"
              render={<Link to={to} />}
              className={cn(
                "gap-1.5",
                pathname === to && "bg-muted text-primary",
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <Avatar size="sm">
                <AvatarFallback>
                  {user.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
