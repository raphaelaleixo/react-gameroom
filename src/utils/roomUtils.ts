const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Generates a random alphanumeric room code.
 * Uses `crypto.getRandomValues` when available, falls back to `Math.random`.
 * @param length - Length of the generated code (default: 5).
 * @returns An uppercase alphanumeric string.
 */
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

/**
 * Builds a full URL for a room. Prepends `window.location.origin` in browser environments.
 * @param roomId - The room identifier.
 * @param basePath - Optional path prefix (e.g., "/app").
 * @returns URL in the form `{origin}{basePath}/room/{roomId}`.
 */
export function buildRoomUrl(roomId: string, basePath: string = ""): string {
  const prefix = typeof window !== "undefined" ? window.location.origin + basePath : basePath;
  return `${prefix}/room/${roomId}`;
}

/**
 * Builds a full URL for a specific player slot. Prepends `window.location.origin` in browser environments.
 * @param roomId - The room identifier.
 * @param playerId - 1-based player slot ID.
 * @param basePath - Optional path prefix (e.g., "/app").
 * @returns URL in the form `{origin}{basePath}/room/{roomId}/player/{playerId}`.
 */
export function buildPlayerUrl(roomId: string, playerId: number, basePath: string = ""): string {
  const prefix = typeof window !== "undefined" ? window.location.origin + basePath : basePath;
  return `${prefix}/room/${roomId}/player/${playerId}`;
}

/**
 * Builds a URL for the generic player join page (no specific slot).
 * Used for first-come-first-served lobbies where players are auto-assigned seats.
 * @param roomId - The room identifier.
 * @param basePath - Optional path prefix (e.g., "/app").
 * @returns URL in the form `{origin}{basePath}/room/{roomId}/player`.
 */
export function buildJoinUrl(roomId: string, basePath: string = ""): string {
  const prefix = typeof window !== "undefined" ? window.location.origin + basePath : basePath;
  return `${prefix}/room/${roomId}/player`;
}

/**
 * Builds a URL for the player rejoin grid (shown when game is started).
 * @param roomId - The room identifier.
 * @param basePath - Optional path prefix (e.g., "/app").
 * @returns URL in the form `{origin}{basePath}/room/{roomId}/players`.
 */
export function buildRejoinUrl(roomId: string, basePath: string = ""): string {
  const prefix = typeof window !== "undefined" ? window.location.origin + basePath : basePath;
  return `${prefix}/room/${roomId}/players`;
}

/**
 * Parses a URL to extract room and optional player IDs.
 * Recognizes `/room/{roomId}`, `/room/{roomId}/player/{playerId}`,
 * `/room/{roomId}/player` (join), and `/room/{roomId}/players` (rejoin) patterns.
 * @param url - The URL to parse (absolute or relative).
 * @returns An object with `roomId` and optional `playerId`, `isJoin`, or `isRejoin`, or `null` if the URL doesn't match.
 */
export function parseRoomFromUrl(
  url: string
): { roomId: string; playerId?: number; isJoin?: boolean; isRejoin?: boolean } | null {
  try {
    const parsed = new URL(url, "http://localhost");
    const segments = parsed.pathname.split("/").filter(Boolean);

    const roomIndex = segments.indexOf("room");
    if (roomIndex === -1 || roomIndex + 1 >= segments.length) return null;

    const roomId = segments[roomIndex + 1];
    if (!roomId) return null;

    // /room/{id}/players → rejoin grid
    const playersIndex = segments.indexOf("players");
    if (playersIndex !== -1) {
      return { roomId, isRejoin: true };
    }

    const playerIndex = segments.indexOf("player");
    if (playerIndex !== -1) {
      if (playerIndex + 1 < segments.length) {
        const playerId = parseInt(segments[playerIndex + 1], 10);
        if (!isNaN(playerId) && playerId > 0) {
          return { roomId, playerId };
        }
      }
      // /room/{id}/player with no trailing number → join URL
      return { roomId, isJoin: true };
    }

    return { roomId };
  } catch {
    return null;
  }
}
