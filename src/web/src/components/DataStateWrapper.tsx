import { useState, type ReactNode } from "react";
import { AlertCircle, Image, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type DataState = "loading" | "error" | "empty" | "data";

interface DataStateWrapperProps {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  onRetry?: () => void;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCta?: string;
  onEmptyCta?: () => void;
  children: ReactNode;
}

function resolveState(props: DataStateWrapperProps, override: DataState | null): DataState {
  if (override) return override;
  if (props.loading) return "loading";
  if (props.error) return "error";
  if (props.isEmpty) return "empty";
  return "data";
}

export default function DataStateWrapper(props: DataStateWrapperProps) {
  const {
    error,
    onRetry,
    emptyIcon,
    emptyTitle = "Nothing here yet",
    emptyDescription = "Start adding some memories!",
    emptyCta = "Get started",
    onEmptyCta,
    children,
  } = props;

  const [override, setOverride] = useState<DataState | null>(null);
  const state = resolveState(props, override);

  return (
    <div className="relative">
      {/* Dev-only state toggle */}
      {import.meta.env.DEV && (
        <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-dashed border-border bg-muted/50 p-2 text-xs">
          <span className="mr-1 font-medium text-muted-foreground">
            Dev states:
          </span>
          {(["data", "loading", "error", "empty"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setOverride(s === "data" ? null : s)}
              className={`rounded px-2 py-0.5 transition ${
                state === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {state === "loading" && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-7">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl bg-white p-3 shadow-md">
              <Skeleton className="aspect-[4/3] w-full rounded-sm" />
              <Skeleton className="mx-auto h-4 w-3/4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <Alert variant="destructive" className="mx-auto max-w-md">
          <AlertCircle className="size-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error ?? "An unexpected error occurred."}</AlertDescription>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={onRetry}
            >
              <RefreshCw className="size-3" />
              Try again
            </Button>
          )}
        </Alert>
      )}

      {state === "empty" && (
        <Card className="mx-auto max-w-sm text-center">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            {emptyIcon ?? <Image className="size-12 text-muted-foreground/50" />}
            <h3 className="text-lg font-medium">{emptyTitle}</h3>
            <p className="text-sm text-muted-foreground">{emptyDescription}</p>
            {onEmptyCta && (
              <Button size="sm" onClick={onEmptyCta}>
                {emptyCta}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {state === "data" && children}
    </div>
  );
}
