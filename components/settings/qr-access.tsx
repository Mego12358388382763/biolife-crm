"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";

// Fixed to the canonical production URL rather than window.location.origin
// so the QR code is correct even when viewed from a preview/branch deploy.
// Contains only the URL — no tokens, credentials, or user data.
const CRM_LOGIN_URL = "https://biolife-crm.netlify.app/login";

export function QrAccess() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, CRM_LOGIN_URL, { width: 200, margin: 2 }).catch(() => {});
  }, []);

  async function copyUrl() {
    await navigator.clipboard.writeText(CRM_LOGIN_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "biolife-crm-login-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <canvas ref={canvasRef} className="rounded-md border p-2" />
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Scanning this code opens the CRM login page. It contains only the URL below — no passwords, tokens, or
          user data.
        </p>
        <code className="block rounded bg-muted px-2 py-1 text-sm">{CRM_LOGIN_URL}</code>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={copyUrl}>
            {copied ? "Copied" : "Copy CRM URL"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={downloadPng}>
            Download PNG
          </Button>
        </div>
      </div>
    </div>
  );
}
