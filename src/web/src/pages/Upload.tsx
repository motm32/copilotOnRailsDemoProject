import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from "react";
import { Upload as UploadIcon, X, Image } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePhotos } from "@/hooks/usePhotos";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const { uploadPhoto } = usePhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const images = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/"),
    );
    setFiles((prev) => [...prev, ...images]);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      await uploadPhoto(file, note);
    }
    setFiles([]);
    setNote("");
    setUploading(false);
  }, [files, note, uploadPhoto]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <UploadIcon className="size-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Upload Photos</CardTitle>
          <CardDescription>Add new memories to your scrapbook</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30",
            )}
          >
            <Image className="size-10 text-muted-foreground/50" />
            <div>
              <p className="font-medium text-foreground">
                Drag &amp; drop photos here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected files ({files.length})</Label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                {files.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-3 rounded-md bg-muted/50 p-2"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="size-10 rounded object-cover"
                    />
                    <span className="flex-1 truncate text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Add a note (optional)</Label>
            <Input
              id="note"
              placeholder="What's the story behind these photos?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {note.length}/200 characters
            </p>
          </div>

          {/* Upload Button */}
          <Button
            className="w-full gap-1.5"
            disabled={files.length === 0 || uploading}
            onClick={handleUpload}
          >
            <UploadIcon className="size-4" />
            {uploading
              ? "Uploading..."
              : `Upload ${files.length || ""} ${files.length === 1 ? "photo" : "photos"}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
