import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { buildRoomUrl } from "../utils/roomUtils";

export interface RoomQRCodeProps {
  /** Room identifier, used to generate the default QR URL via `buildRoomUrl`. */
  roomId: string;
  /** Custom URL to encode. When provided, overrides the URL that would be built from `roomId`. */
  url?: string;
  size?: number;
  className?: string;
}

export function RoomQRCode({ roomId, url, size = 128, className }: RoomQRCodeProps) {
  const value = url ?? buildRoomUrl(roomId);

  return (
    <div
      className={className}
      role="img"
      aria-label={`QR code to join room ${roomId}`}
      style={{ display: "inline-block" }}
    >
      <QRCodeSVG value={value} size={size} title={`QR code to join room ${roomId}`} />
    </div>
  );
}
