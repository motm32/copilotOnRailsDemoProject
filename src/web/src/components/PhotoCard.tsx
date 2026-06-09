import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types";

const rotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0.5", "-rotate-0.5"];

interface PhotoCardProps {
  photo: Photo;
  index: number;
}

export default function PhotoCard({ photo, index }: PhotoCardProps) {
  const rotation = rotations[index % rotations.length];

  return (
    <Card
      className={cn(
        "group relative overflow-visible bg-white p-3 pb-4 shadow-md transition-transform hover:scale-105 hover:rotate-0 hover:shadow-xl",
        rotation,
        // Tape decoration
        "before:absolute before:-top-2.5 before:left-1/2 before:-translate-x-1/2 before:h-5 before:w-12 before:rounded-sm before:bg-amber-200/70 before:shadow-sm before:content-['']",
      )}
    >
      {/* Photo */}
      <div className="relative overflow-hidden rounded-sm">
        <img
          src={photo.url}
          alt={photo.caption}
          className="aspect-[4/3] w-full object-cover"
          loading="lazy"
        />
        {/* AI Caption Badge */}
        <Badge
          variant="secondary"
          className="absolute bottom-2 left-2 gap-1 bg-white/90 text-xs text-primary backdrop-blur-sm"
        >
          <Sparkles className="size-3" />
          AI
        </Badge>
      </div>

      {/* Caption */}
      <p className="mt-3 text-center font-medium text-foreground italic">
        &ldquo;{photo.aiCaption}&rdquo;
      </p>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Avatar size="sm">
            <AvatarFallback className="text-[10px]">
              {photo.uploadedBy.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span>{photo.uploadedBy.displayName}</span>
        </div>
        <time dateTime={photo.createdAt}>
          {new Date(photo.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>
      </div>
    </Card>
  );
}
