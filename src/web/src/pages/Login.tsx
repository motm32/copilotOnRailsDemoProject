import { useState } from "react";
import { Heart, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { login, register } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await login(loginEmail, loginPassword);
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await register(regEmail, regPassword, regName);
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="size-6 fill-primary text-primary" />
          </div>
          <CardTitle className="text-2xl">OurScrapbook</CardTitle>
          <CardDescription>
            Your shared photo memories, together
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleLogin} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-1.5"
                  disabled={submitting}
                >
                  <Lock className="size-4" />
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Display Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Your name"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-1.5"
                  disabled={submitting}
                >
                  {submitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
