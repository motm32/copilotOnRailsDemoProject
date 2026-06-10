import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/api/client";

export function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !password || (isSignUp && !displayName)) {
            setError("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            if (isSignUp) {
                await api.createUser(email, displayName, password);
            }
            const { token } = await api.login(email, password);
            localStorage.setItem("auth_token", token);
            navigate("/");
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center">
                        <Heart className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">
                        {isSignUp ? "Create an account" : "Welcome back"}
                    </CardTitle>
                    <CardDescription>
                        {isSignUp
                            ? "Sign up to start your scrapbook"
                            : "Sign in to your scrapbook"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        {isSignUp && (
                            <div className="space-y-2">
                                <Label htmlFor="displayName">
                                    Display Name
                                </Label>
                                <Input
                                    id="displayName"
                                    type="text"
                                    placeholder="Alex Johnson"
                                    value={displayName}
                                    onChange={(e) =>
                                        setDisplayName(e.target.value)
                                    }
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading
                                ? "Loading..."
                                : isSignUp
                                  ? "Sign Up"
                                  : "Sign In"}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            {isSignUp
                                ? "Already have an account? "
                                : "Don't have an account? "}
                            <button
                                type="button"
                                className="text-primary font-medium hover:underline"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError(null);
                                }}
                            >
                                {isSignUp ? "Sign in" : "Sign up"}
                            </button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
