"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

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
}: QRCodeComponentProps) {
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
          color: {
            dark: "#1f2937",
            light: "#ffffff",
          },
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
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg p-2 bg-white"
      />
      <p className="text-sm text-muted text-center">
        Scan this QR code to view batch details
      </p>
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
}: QRCodeDownloadProps) {
  const handleDownload = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(value, {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#1f2937",
          light: "#ffffff",
        },
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
      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm"
    >
      Download QR Code
    </button>
  );
}
