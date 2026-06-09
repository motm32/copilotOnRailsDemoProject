import { useState } from "react";
import { Heart, Copy, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { mockCouple } from "@/mocks/data";

export default function Pair() {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mockCouple.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);
    await new Promise((r) => setTimeout(r, 800));
    setJoining(false);
    setJoinCode("");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Paired Status */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="size-6 fill-primary text-primary" />
          </div>
          <CardTitle className="text-xl">Your Couple</CardTitle>
          <CardDescription>You&apos;re paired and making memories!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-6">
            {/* Partner 1 */}
            <div className="flex flex-col items-center gap-2">
              <Avatar size="lg">
                <AvatarFallback>{mockCouple.partner1.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {mockCouple.partner1.displayName}
              </span>
              {user?.id === mockCouple.partner1.id && (
                <Badge variant="secondary">You</Badge>
              )}
            </div>

            <Heart className="size-6 fill-accent text-accent" />

            {/* Partner 2 */}
            {mockCouple.partner2 ? (
              <div className="flex flex-col items-center gap-2">
                <Avatar size="lg">
                  <AvatarFallback>{mockCouple.partner2.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {mockCouple.partner2.displayName}
                </span>
                {user?.id === mockCouple.partner2.id && (
                  <Badge variant="secondary">You</Badge>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-border">
                  ?
                </div>
                <span className="text-sm">Waiting...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="size-5 text-primary" />
            Invite Your Partner
          </CardTitle>
          <CardDescription>
            Share this code with your partner to pair up
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={mockCouple.inviteCode}
              className="font-mono text-center text-lg tracking-wider"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Copy invite code"
            >
              <Copy className="size-4" />
            </Button>
          </div>
          {copied && (
            <p className="text-center text-sm text-primary">
              Copied to clipboard!
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Join with Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Join with Code</CardTitle>
          <CardDescription>
            Have an invite code? Enter it below to pair up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="flex gap-2">
            <Input
              placeholder="XXXX-XXXX-XXXX"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="font-mono tracking-wider"
              required
            />
            <Button type="submit" disabled={joining || !joinCode.trim()}>
              {joining ? "Joining..." : "Join"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
