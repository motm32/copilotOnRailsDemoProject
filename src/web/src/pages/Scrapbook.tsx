import { useNavigate } from "react-router-dom";
import { Camera, Heart, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ScrapbookGrid from "@/components/ScrapbookGrid";
import DataStateWrapper from "@/components/DataStateWrapper";
import { usePhotos } from "@/hooks/usePhotos";
import { mockCouple } from "@/mocks/data";

export default function Scrapbook() {
  const { photos, loading, error, isEmpty } = usePhotos();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <Card className="mb-10 overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="size-6 fill-primary text-primary" />
          </div>
          <CardTitle className="text-2xl">{mockCouple.name}</CardTitle>
          <CardDescription>
            {photos.length} {photos.length === 1 ? "memory" : "memories"} and counting
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <Button className="gap-1.5" onClick={() => navigate("/upload")}>
            <Plus className="size-4" />
            Add Photos
          </Button>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      <DataStateWrapper
        loading={loading}
        error={error}
        isEmpty={isEmpty}
        emptyIcon={<Camera className="size-12 text-muted-foreground/50" />}
        emptyTitle="No memories yet"
        emptyDescription="Upload your first photo to start your scrapbook!"
        emptyCta="Upload a photo"
        onEmptyCta={() => navigate("/upload")}
      >
        <ScrapbookGrid photos={photos} />
      </DataStateWrapper>
    </div>
  );
}
