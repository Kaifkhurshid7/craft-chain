"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

const QR_COLORS = { dark: "#1F2421", light: "#F7F4EE" };

interface QRCodeComponentProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  className?: string;
}

export function QRCodeComponent({
  value,
  size = 256,
  level = "H",
  className = "",
}: QRCodeComponentProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          errorCorrectionLevel: level,
          color: QR_COLORS,
        },
        (error) => {
          if (error) {
            console.error("Error generating QR code:", error);
          }
        }
      );
    }
  }, [value, size, level]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="rounded-md border border-forest/15 bg-paper p-2"
      />
    </div>
  );
}

interface QRCodeDownloadProps extends QRCodeComponentProps {
  fileName?: string;
}

export function QRCodeDownloadButton({
  value,
  size = 256,
  fileName = "batch-qr-code",
}: QRCodeDownloadProps): JSX.Element {
  const handleDownload = async (): Promise<void> => {
    try {
      const dataUrl = await QRCode.toDataURL(value, {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: QR_COLORS,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-forest/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:border-forest hover:text-forest"
    >
      <Download size={14} strokeWidth={1.7} aria-hidden="true" />
      <span>Download QR Code</span>
    </button>
  );
}
