"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ExportImageButton({
  targetId,
  fileName,
}: {
  targetId: string;
  fileName: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleExport() {
    const node = document.getElementById(targetId);
    if (!node) return;

    setPending(true);
    try {
      const dataUrl = await toPng(node, {
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("No se pudo generar la imagen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={pending}>
      <Download className="size-4" />
      {pending ? "Generando..." : "Exportar imagen"}
    </Button>
  );
}
