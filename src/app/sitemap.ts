import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const players = await prisma.player.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/dashboard`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${siteUrl}/comparar`, changeFrequency: "daily", priority: 0.5 },
    { url: `${siteUrl}/buscar`, changeFrequency: "daily", priority: 0.3 },
  ];

  const playerRoutes: MetadataRoute.Sitemap = players.map((p) => ({
    url: `${siteUrl}/jugador/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticRoutes, ...playerRoutes];
}
