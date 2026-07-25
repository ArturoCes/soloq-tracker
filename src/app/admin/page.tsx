import { prisma } from "@/lib/db";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UpdateClassificationButton } from "@/components/admin/update-classification-button";
import { AddPlayerForm } from "@/components/admin/add-player-form";
import { UnofficialAccountForm } from "@/components/admin/unofficial-account-form";
import { PlayerList } from "@/components/admin/player-list";
import { ApiErrorList } from "@/components/admin/api-error-list";

export const dynamic = "force-dynamic";
// The Riot API rate limiter serializes requests, so updating many players
// with a wide match history can take a while — give the Server Action room.
export const maxDuration = 300;

export default async function AdminPage() {
  const [players, lastUpdates, recentErrors] = await Promise.all([
    prisma.player.findMany({ orderBy: [{ isUnofficial: "asc" }, { leaguePoints: "desc" }] }),
    prisma.updateLog.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
    prisma.apiError.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { player: { select: { gameName: true, tagLine: true } } },
    }),
  ]);

  const unofficial = players.find((p) => p.isUnofficial);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administración</h1>
          <p className="text-muted-foreground">Panel privado del SoloQ Tracker.</p>
        </div>
        <form action={logoutAction}>
          <Button variant="ghost" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actualizar clasificación</CardTitle>
          <CardDescription>
            Consulta la Riot API para todos los jugadores activos y reordena la clasificación.
            {lastUpdates[0] && (
              <>
                {" "}
                Última ejecución: {lastUpdates[0].startedAt.toLocaleString("es-ES")} (
                {lastUpdates[0].status}).
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateClassificationButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mi cuenta (participante no oficial)</CardTitle>
          <CardDescription>
            Se mostrará siempre marcada como 🟢 Participante no oficial, nunca como oficial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnofficialAccountForm key={unofficial?.id ?? "empty"} current={unofficial ?? null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Añadir jugador</CardTitle>
          <CardDescription>Riot ID en formato Nombre + Tag (sin la almohadilla).</CardDescription>
        </CardHeader>
        <CardContent>
          <AddPlayerForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jugadores ({players.length})</CardTitle>
          <CardDescription>Activa, desactiva o elimina participantes.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerList players={players} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Errores de la API</CardTitle>
          <CardDescription>Últimos errores registrados durante las actualizaciones.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApiErrorList errors={recentErrors} />
        </CardContent>
      </Card>
    </div>
  );
}
