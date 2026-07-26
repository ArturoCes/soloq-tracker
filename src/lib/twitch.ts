const TWITCH_LOGIN = "hardgam3rpro";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAppAccessToken(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

/** Whether the channel is currently live, via Twitch's official Helix API. Returns false if not configured. */
export async function isChannelLive(): Promise<boolean> {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const token = await getAppAccessToken();
    if (!clientId || !token) return false;

    const res = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(TWITCH_LOGIN)}`,
      {
        headers: { "Client-Id": clientId, Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return false;

    const data = (await res.json()) as { data: unknown[] };
    return data.data.length > 0;
  } catch {
    return false;
  }
}

let cachedBroadcasterId: string | null = null;

async function getBroadcasterId(): Promise<string | null> {
  if (cachedBroadcasterId) return cachedBroadcasterId;

  const clientId = process.env.TWITCH_CLIENT_ID;
  const token = await getAppAccessToken();
  if (!clientId || !token) return null;

  const res = await fetch(
    `https://api.twitch.tv/helix/users?login=${encodeURIComponent(TWITCH_LOGIN)}`,
    { headers: { "Client-Id": clientId, Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;

  const data = (await res.json()) as { data: { id: string }[] };
  const id = data.data[0]?.id ?? null;
  cachedBroadcasterId = id;
  return id;
}

export type TwitchClip = {
  id: string;
  url: string;
  embedUrl: string;
  title: string;
  viewCount: number;
  createdAt: string;
  thumbnailUrl: string;
  durationSeconds: number;
};

/** The channel's most-viewed clips, via Twitch's official Helix API. Empty if not configured. */
export async function getTopClips(limit = 24): Promise<TwitchClip[]> {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const token = await getAppAccessToken();
    const broadcasterId = await getBroadcasterId();
    if (!clientId || !token || !broadcasterId) return [];

    const res = await fetch(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}&first=100`,
      {
        headers: { "Client-Id": clientId, Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];

    const data = (await res.json()) as {
      data: {
        id: string;
        url: string;
        embed_url: string;
        title: string;
        view_count: number;
        created_at: string;
        thumbnail_url: string;
        duration: number;
      }[];
    };

    return data.data
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, limit)
      .map((c) => ({
        id: c.id,
        url: c.url,
        embedUrl: c.embed_url,
        title: c.title,
        viewCount: c.view_count,
        createdAt: c.created_at,
        thumbnailUrl: c.thumbnail_url,
        durationSeconds: c.duration,
      }));
  } catch {
    return [];
  }
}
