"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { addPlayerAction } from "@/lib/actions/admin";
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

export function AddPlayerForm() {
  const [state, formAction, pending] = useActionState(addPlayerAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) {
      toast.success("Jugador añadido. Pulsa 'Actualizar clasificación' para traer sus datos.");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="gameName">Nombre</Label>
        <Input id="gameName" name="gameName" placeholder="Faker" required className="w-40" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tagLine">Tag</Label>
        <Input id="tagLine" name="tagLine" placeholder="EUW" required className="w-24" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="platform">Región</Label>
        <Select name="platform" defaultValue="euw1">
          <SelectTrigger id="platform" className="w-32">
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
      <Button type="submit" disabled={pending}>
        {pending ? "Añadiendo..." : "Añadir jugador"}
      </Button>
      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
