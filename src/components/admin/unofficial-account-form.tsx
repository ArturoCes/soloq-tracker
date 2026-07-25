"use client";

import { useActionState } from "react";
import { updateUnofficialAccountAction } from "@/lib/actions/admin";
import { SUPPORTED_PLATFORMS } from "@/lib/riot/regions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UnofficialAccountForm({
  current,
}: {
  current: { gameName: string; tagLine: string; platform: string } | null;
}) {
  const [state, formAction, pending] = useActionState(updateUnofficialAccountAction, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="u-gameName">Nombre</Label>
        <Input
          id="u-gameName"
          name="gameName"
          defaultValue={current?.gameName}
          placeholder="TuNombre"
          required
          className="w-40"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="u-tagLine">Tag</Label>
        <Input
          id="u-tagLine"
          name="tagLine"
          defaultValue={current?.tagLine}
          placeholder="EUW"
          required
          className="w-24"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="u-platform">Región</Label>
        <Select name="platform" defaultValue={current?.platform ?? "euw1"}>
          <SelectTrigger id="u-platform" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Guardando..." : "Guardar mi cuenta"}
      </Button>
      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
