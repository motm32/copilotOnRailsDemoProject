import { useState } from "react";
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
import { currentUser, partner, currentPair, photos } from "@/mocks/data";

export function PairPage() {
    const [inviteEmail, setInviteEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [inviteSent, setInviteSent] = useState(false);

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError(null);
        if (!inviteEmail || !inviteEmail.includes("@")) {
            setEmailError("Please enter a valid email address");
            return;
        }
        setInviteSent(true);
        setTimeout(() => setInviteSent(false), 3000);
    };

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold">Your Pair</h1>
                <p className="text-muted-foreground text-sm">
                    Manage your scrapbook partnership
                </p>
            </div>

            {/* Current pair status */}
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
                                <AvatarImage src={currentUser.avatarUrl} />
                                <AvatarFallback>AJ</AvatarFallback>
                            </Avatar>
                            <Avatar className="border-2 border-background">
                                <AvatarImage src={partner.avatarUrl} />
                                <AvatarFallback>JS</AvatarFallback>
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
                                })}{" "}
                                · {photos.length} shared photos
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

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

                    {/* Pending invites */}
                    <div className="mt-6 space-y-2">
                        <h4 className="text-sm font-medium">Pending Invites</h4>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                            <span className="text-sm">friend@example.com</span>
                            <Badge variant="secondary">Pending</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
