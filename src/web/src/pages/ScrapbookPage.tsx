import { useState } from "react";
import { Sparkles, Trash2, AlertCircle, ImageIcon, Upload } from "lucide-react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { photos, currentUser, partner } from "@/mocks/data";
import type { Photo } from "@/types";
import { useNavigate } from "react-router-dom";

type ViewState = "loading" | "error" | "empty" | "data";

export function ScrapbookPage() {
    const navigate = useNavigate();
    const [viewState, setViewState] = useState<ViewState>("data");
    const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold">
                    {currentUser.displayName} & {partner.displayName}'s
                    Scrapbook
                </h1>
                <p className="text-muted-foreground">
                    {photos.length} memories together · Paired since March 2026
                </p>
            </div>

            {/* Dev state toggle */}
            {import.meta.env.DEV && (
                <div className="flex gap-2 justify-center">
                    {(["data", "loading", "error", "empty"] as ViewState[]).map(
                        (s) => (
                            <Button
                                key={s}
                                variant={
                                    viewState === s ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setViewState(s)}
                            >
                                {s}
                            </Button>
                        ),
                    )}
                </div>
            )}

            {/* Loading state */}
            {viewState === "loading" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="aspect-[4/3] w-full" />
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-4 w-[90%]" />
                                <Skeleton className="h-4 w-[70%]" />
                                <Skeleton className="h-3 w-[40%]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Error state */}
            {viewState === "error" && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between w-full">
                        <span>
                            Failed to load photos. Please check your connection
                            and try again.
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewState("data")}
                        >
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Empty state */}
            {viewState === "empty" && (
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <ImageIcon className="h-14 w-14 text-muted-foreground opacity-60" />
                        <div>
                            <h3 className="text-lg font-semibold">
                                Your scrapbook is empty
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Upload your first photo together to start
                                building memories!
                            </p>
                        </div>
                        <Button onClick={() => navigate("/upload")}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload First Photo
                        </Button>
                    </div>
                </Card>
            )}

            {/* Data state — photo grid */}
            {viewState === "data" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {photos.map((photo) => (
                        <Card
                            key={photo.id}
                            className="overflow-hidden group hover:shadow-lg transition-shadow"
                        >
                            <div className="aspect-[4/3] overflow-hidden">
                                <img
                                    src={photo.blobUrl}
                                    alt={photo.caption || "Scrapbook photo"}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <CardContent className="p-4">
                                {photo.caption && (
                                    <p className="text-sm italic text-foreground leading-relaxed">
                                        "{photo.caption}"
                                    </p>
                                )}
                            </CardContent>
                            <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage
                                            src={
                                                photo.uploaderId ===
                                                currentUser.id
                                                    ? currentUser.avatarUrl
                                                    : partner.avatarUrl
                                            }
                                        />
                                        <AvatarFallback className="text-xs">
                                            {photo.uploaderName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                        {photo.uploaderName} ·{" "}
                                        {new Date(
                                            photo.createdAt,
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {photo.caption && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs gap-1"
                                        >
                                            <Sparkles className="h-3 w-3" />
                                            AI
                                        </Badge>
                                    )}
                                    {photo.uploaderId === currentUser.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() =>
                                                setDeleteTarget(photo)
                                            }
                                        >
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete confirmation dialog */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this photo?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The photo and its
                            AI-generated caption will be permanently removed
                            from your scrapbook.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Delete Photo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
