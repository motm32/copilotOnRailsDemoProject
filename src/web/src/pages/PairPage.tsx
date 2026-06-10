import { useState, useEffect } from "react";
import { Users, Mail, Check } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/api/client";
import type { User, Pair, PairInvite } from "@/types";

export function PairPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<User | null>(null);
    const [currentPair, setCurrentPair] = useState<Pair | null>(null);
    const [pendingInvite, setPendingInvite] = useState<PairInvite | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [inviteSent, setInviteSent] = useState(false);
    const [accepting, setAccepting] = useState(false);

    const loadData = () => {
        Promise.all([api.me(), api.getPairStatus()]).then(([meRes, pairRes]) => {
            setCurrentUser(meRes.user);
            setPartner(pairRes.partner);
            setCurrentPair(pairRes.pair);
            setPendingInvite(pairRes.pendingInvite);
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError(null);
        if (!inviteEmail || !inviteEmail.includes("@")) {
            setEmailError("Please enter a valid email address");
            return;
        }
        try {
            await api.sendInvite(inviteEmail);
            setInviteSent(true);
            setTimeout(() => setInviteSent(false), 3000);
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setEmailError(err.message);
            } else {
                setEmailError("Failed to send invite");
            }
        }
    };

    const handleAcceptInvite = async () => {
        if (!pendingInvite) return;
        setAccepting(true);
        try {
            await api.acceptInvite(pendingInvite.id);
            loadData();
        } catch {
            // ignore
        } finally {
            setAccepting(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold">Your Pair</h1>
                <p className="text-muted-foreground text-sm">
                    Manage your scrapbook partnership
                </p>
            </div>

            {/* Current pair status */}
            {currentPair && partner && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Paired
                        </CardTitle>
                        <CardDescription>
                            You and your partner share a scrapbook
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                <Avatar className="border-2 border-background">
                                    <AvatarImage src={currentUser.avatarUrl ?? undefined} />
                                    <AvatarFallback>{currentUser.displayName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <Avatar className="border-2 border-background">
                                    <AvatarImage src={partner.avatarUrl ?? undefined} />
                                    <AvatarFallback>{partner.displayName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div>
                                <p className="font-medium">
                                    {currentUser.displayName} &{" "}
                                    {partner.displayName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Connected since{" "}
                                    {new Date(
                                        currentPair.createdAt,
                                    ).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pending invite received */}
            {!currentPair && pendingInvite && (
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            You have a pair invite!
                        </CardTitle>
                        <CardDescription>
                            Someone wants to share a scrapbook with you
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Invited on{" "}
                                    {new Date(pendingInvite.createdAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                            <Button onClick={handleAcceptInvite} disabled={accepting}>
                                <Check className="h-4 w-4 mr-2" />
                                {accepting ? "Accepting..." : "Accept Invite"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Separator />

            {/* Invite section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Invite a new partner
                    </CardTitle>
                    <CardDescription>
                        Send an invite to start a new scrapbook together
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="partnerEmail">
                                Partner's email address
                            </Label>
                            <Input
                                id="partnerEmail"
                                type="email"
                                placeholder="partner@example.com"
                                value={inviteEmail}
                                onChange={(e) => {
                                    setInviteEmail(e.target.value);
                                    setEmailError(null);
                                }}
                                className={
                                    emailError ? "border-destructive" : ""
                                }
                            />
                            {emailError && (
                                <p className="text-sm text-destructive">
                                    {emailError}
                                </p>
                            )}
                        </div>
                        <Button type="submit" className="gap-2">
                            {inviteSent ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Invite Sent!
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4" />
                                    Send Invite
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
