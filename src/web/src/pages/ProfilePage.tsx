import { useState } from "react";
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
import { currentUser } from "@/mocks/data";

export function ProfilePage() {
    const [displayName, setDisplayName] = useState(currentUser.displayName);
    const [saved, setSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

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
                            <AvatarImage src={currentUser.avatarUrl} />
                            <AvatarFallback className="text-lg">
                                AJ
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
