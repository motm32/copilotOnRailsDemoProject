import { useState, useRef } from "react";
import { Upload, ImageIcon, X } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function UploadPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        setError(null);
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Please select a JPG, PNG, or WebP image.");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError("File must be under 10MB.");
            return;
        }
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleUpload = () => {
        if (!selectedFile) return;
        setUploading(true);
        // Mock upload
        setTimeout(() => {
            setUploading(false);
            setSelectedFile(null);
            setPreview(null);
        }, 1500);
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold">Upload a Photo</h1>
                <p className="text-muted-foreground text-sm">
                    Add a new memory to your shared scrapbook
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Choose a photo</CardTitle>
                    <CardDescription>
                        JPG, PNG, or WebP up to 10MB
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!preview ? (
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => inputRef.current?.click()}
                        >
                            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-medium mb-1">
                                Drag & drop your photo here
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                or click to browse
                            </p>
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) =>
                                    e.target.files?.[0] &&
                                    handleFileSelect(e.target.files[0])
                                }
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative rounded-lg overflow-hidden">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full max-h-80 object-cover"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview(null);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ImageIcon className="h-4 w-4" />
                                <span>{selectedFile?.name}</span>
                                <span>·</span>
                                <span>
                                    {(selectedFile!.size / 1024 / 1024).toFixed(
                                        1,
                                    )}{" "}
                                    MB
                                </span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 flex gap-3">
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            className="flex-1"
                        >
                            {uploading
                                ? "Uploading..."
                                : "Upload & Generate Caption"}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        An AI-generated caption will be added automatically
                        after upload
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
