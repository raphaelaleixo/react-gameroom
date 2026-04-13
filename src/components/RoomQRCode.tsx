import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { buildRoomUrl } from "../utils/roomUtils";

export interface RoomQRCodeProps {
  roomId: string;
  url?: string;
  size?: number;
  className?: string;
}

export function RoomQRCode({ roomId, url, size = 128, className }: RoomQRCodeProps) {
  const value = url ?? buildRoomUrl(roomId);

  return (
    <div className={className} style={{ display: "inline-block" }}>
      <QRCodeSVG value={value} size={size} />
    </div>
  );
}
