import { useState } from "react";
import { Edit, Trash2, Camera, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { mockPhotos, mockCouple } from "@/mocks/data";

export default function Profile() {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  const myPhotos = mockPhotos.filter((p) => p.uploadedBy.id === user.id);
  const partnerPhotos = mockPhotos.filter((p) => p.uploadedBy.id !== user.id);
  const partner = mockCouple.partner2;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Profile Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto">
            <Avatar size="lg" className="size-20">
              <AvatarFallback className="text-2xl">
                {user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">{user.displayName}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-2xl font-bold text-primary">{myPhotos.length}</p>
              <p className="text-sm text-muted-foreground">Your photos</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-2xl font-bold text-accent">
                {partnerPhotos.length}
              </p>
              <p className="text-sm text-muted-foreground">
                {partner?.displayName ?? "Partner"}&apos;s photos
              </p>
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="justify-center pb-4 pt-4">
          <Button variant="outline" className="gap-1.5">
            <Edit className="size-4" />
            Edit Profile
          </Button>
        </CardFooter>
      </Card>

      {/* Recent Photos Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="size-5 text-primary" />
            Your Recent Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {myPhotos.slice(0, 3).map((photo) => (
                <div key={photo.id} className="group relative">
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.caption}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="absolute right-1 top-1 hidden rounded-full bg-destructive/90 p-1 text-white transition group-hover:flex"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No photos uploaded yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog Mock */}
      {showDeleteConfirm && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertCircle className="size-5" />
              Delete Photo?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>This action cannot be undone</AlertTitle>
              <AlertDescription>
                The photo will be permanently removed from your scrapbook.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="justify-end gap-2 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
