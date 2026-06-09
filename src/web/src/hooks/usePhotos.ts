import { useState, useCallback, useEffect } from "react";
import type { Photo } from "@/types";
import { mockPhotos } from "@/mocks/data";

interface UsePhotosReturn {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  uploadPhoto: (file: File, note: string) => Promise<void>;
  deletePhoto: (id: string) => void;
}

export function usePhotos(): UsePhotosReturn {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhotos(mockPhotos);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const uploadPhoto = useCallback(async (_file: File, note: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const newPhoto: Photo = {
      id: crypto.randomUUID(),
      url: `https://picsum.photos/seed/${Date.now()}/400/300`,
      thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/400/300`,
      caption: "New memory",
      aiCaption: "A beautiful new moment captured together",
      note,
      uploadedBy: mockPhotos[0].uploadedBy,
      coupleId: "c1",
      createdAt: new Date().toISOString(),
    };
    setPhotos((prev) => [newPhoto, ...prev]);
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    photos,
    loading,
    error,
    isEmpty: !loading && !error && photos.length === 0,
    uploadPhoto,
    deletePhoto,
  };
}
