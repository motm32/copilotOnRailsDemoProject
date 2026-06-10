import { useState, useEffect } from "react";
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
import { api } from "@/api/client";
import type { User } from "@/types";

export function ProfilePage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.me().then((res) => {
            setCurrentUser(res.user);
            setDisplayName(res.user.displayName);
        });
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!currentUser) return null;

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold">Profile</h1>
                <p className="text-muted-foreground text-sm">
                    Manage your account settings
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={currentUser.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-lg">
                                {currentUser.displayName.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{currentUser.displayName}</CardTitle>
                            <CardDescription>
                                {currentUser.email}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={currentUser.email}
                                readOnly
                                className="bg-muted"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit">
                                {saved ? "Saved!" : "Save Changes"}
                            </Button>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
