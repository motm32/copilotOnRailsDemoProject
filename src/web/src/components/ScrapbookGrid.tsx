import type { Photo } from "@/types";
import PhotoCard from "@/components/PhotoCard";

interface ScrapbookGridProps {
  photos: Photo[];
}

export default function ScrapbookGrid({ photos }: ScrapbookGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-7">
      {photos.map((photo, i) => (
        <PhotoCard key={photo.id} photo={photo} index={i} />
      ))}
    </div>
  );
}
