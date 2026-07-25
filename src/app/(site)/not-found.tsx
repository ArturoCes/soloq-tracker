import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <Compass className="size-10 text-primary" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-muted-foreground">
        No encontramos esa página, o ese invocador no está en nuestra clasificación.
      </p>
      <Button render={<Link href="/" />} className="mt-6">
        Volver a la clasificación
      </Button>
    </div>
  );
}
