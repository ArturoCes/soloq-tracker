import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ApiErrorItem = {
  id: string;
  endpoint: string;
  statusCode: number | null;
  message: string;
  createdAt: Date;
  player: { gameName: string; tagLine: string } | null;
};

export function ApiErrorList({ errors }: { errors: ApiErrorItem[] }) {
  if (errors.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin errores registrados. Todo en orden.</p>;
  }

  return (
    <div className="space-y-2">
      {errors.map((err) => (
        <Alert key={err.id} variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>
            {err.endpoint}
            {err.statusCode ? ` · HTTP ${err.statusCode}` : ""}
            {err.player ? ` · ${err.player.gameName}#${err.player.tagLine}` : ""}
          </AlertTitle>
          <AlertDescription>
            {err.message} — {err.createdAt.toLocaleString("es-ES")}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
