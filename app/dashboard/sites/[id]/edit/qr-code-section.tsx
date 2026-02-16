"use client";

import { useCallback, useRef, useState } from "react";
import QRCode from "qrcode";

type Props = { slug: string; siteUrl: string; hint?: string };

/**
 * QR-01: Generate and download QR code for published site URL (uses the site name/slug the user set).
 */
export function QRCodeSection({ slug, siteUrl, hint }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setError(null);
    if (!canvasRef.current) return;
    try {
      await QRCode.toCanvas(canvasRef.current, siteUrl, {
        width: 256,
        margin: 2,
      });
      setGenerated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate QR code");
    }
  }, [siteUrl]);

  function downloadPng() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `localed-${slug}-qr.png`;
    a.click();
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-medium text-gray-900">QR code</h2>
      <p className="mb-4 text-sm text-gray-600">
        Use this QR code in your shop, on flyers, or in ads. Scanning it opens your site.
      </p>
      <p className="mb-2 text-sm text-gray-500">
        <strong>URL (your site name):</strong> {siteUrl}
      </p>
      {hint && (
        <p className="mb-2 text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mb-2 text-sm text-red-600">{error}</p>
      )}
      <div className="flex flex-wrap items-start gap-4">
        <canvas
          ref={canvasRef}
          className={generated ? "border border-gray-200" : "hidden"}
          width={256}
          height={256}
        />
        {!generated ? (
          <button
            type="button"
            onClick={generate}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Get QR code
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={downloadPng}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Download PNG
            </button>
            <button
              type="button"
              onClick={generate}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
