const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateRoomId(length: number = 5): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr, (x) => CHARS[x % CHARS.length]).join("");
  }
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

export function buildRoomUrl(roomId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/room/${roomId}`;
  }
  return `/room/${roomId}`;
}

export function buildPlayerUrl(roomId: string, playerId: number): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/room/${roomId}/player/${playerId}`;
  }
  return `/room/${roomId}/player/${playerId}`;
}

export function parseRoomFromUrl(
  url: string
): { roomId: string; playerId?: number } | null {
  try {
    const parsed = new URL(url, "http://localhost");
    const segments = parsed.pathname.split("/").filter(Boolean);

    const roomIndex = segments.indexOf("room");
    if (roomIndex === -1 || roomIndex + 1 >= segments.length) return null;

    const roomId = segments[roomIndex + 1];
    if (!roomId) return null;

    const playerIndex = segments.indexOf("player");
    if (playerIndex !== -1 && playerIndex + 1 < segments.length) {
      const playerId = parseInt(segments[playerIndex + 1], 10);
      if (!isNaN(playerId) && playerId > 0) {
        return { roomId, playerId };
      }
    }

    return { roomId };
  } catch {
    return null;
  }
}
