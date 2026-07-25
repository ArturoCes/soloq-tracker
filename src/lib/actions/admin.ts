"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { runFullUpdate, type UpdateSummary } from "@/lib/riot/service";
import { SUPPORTED_PLATFORMS } from "@/lib/riot/regions";

export async function updateClassificationAction(): Promise<UpdateSummary> {
  await requireAdmin();
  const summary = await runFullUpdate();
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/jugador", "layout");
  return summary;
}

export async function addPlayerAction(_prevState: { error: string } | null, formData: FormData) {
  await requireAdmin();

  const gameName = String(formData.get("gameName") ?? "").trim();
  const tagLine = String(formData.get("tagLine") ?? "")
    .trim()
    .replace(/^#/, "");
  const platform = String(formData.get("platform") ?? "").trim();

  if (!gameName || !tagLine || !platform) {
    return { error: "Riot ID y región son obligatorios" };
  }
  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    return { error: "Región no soportada" };
  }

  const existing = await prisma.player.findFirst({
    where: { gameName: { equals: gameName }, tagLine: { equals: tagLine }, platform },
  });
  if (existing) {
    return { error: "Ese Riot ID ya está en la lista" };
  }

  await prisma.player.create({
    data: {
      gameName,
      tagLine,
      platform,
      puuid: `pending-${crypto.randomUUID()}`,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: "" };
}

export async function removePlayerAction(playerId: string) {
  await requireAdmin();
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (player?.isUnofficial) {
    throw new Error("No se puede eliminar la cuenta no oficial desde aquí");
  }
  await prisma.player.delete({ where: { id: playerId } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function togglePlayerActiveAction(playerId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.player.update({ where: { id: playerId }, data: { isActive } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updateUnofficialAccountAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
  await requireAdmin();

  const gameName = String(formData.get("gameName") ?? "").trim();
  const tagLine = String(formData.get("tagLine") ?? "")
    .trim()
    .replace(/^#/, "");
  const platform = String(formData.get("platform") ?? "").trim();

  if (!gameName || !tagLine || !platform) {
    return { error: "Riot ID y región son obligatorios" };
  }
  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    return { error: "Región no soportada" };
  }

  const existing = await prisma.player.findFirst({ where: { isUnofficial: true } });
  if (existing) {
    await prisma.player.update({
      where: { id: existing.id },
      data: { gameName, tagLine, platform, puuid: `pending-${crypto.randomUUID()}` },
    });
  } else {
    await prisma.player.create({
      data: { gameName, tagLine, platform, puuid: `pending-${crypto.randomUUID()}`, isUnofficial: true },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: "" };
}
