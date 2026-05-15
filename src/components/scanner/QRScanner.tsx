"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Camera } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => Promise<{ success: boolean; message: string }>;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async () => {
    try {
      // Always create a fresh instance to avoid state issues
      if (scannerRef.current) {
        try {
          if (scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
            await scannerRef.current.stop();
          }
        } catch (_) { }
        scannerRef.current = null;
      }
      scannerRef.current = new Html5Qrcode("reader");

      setResult(null);
      setScanning(true);

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const boxSize = Math.floor(minEdge * 0.7);
            return { width: boxSize, height: boxSize };
          }
        },
        async (decodedText) => {
          // Guard: only process one scan at a time
          if (loading || !scannerRef.current) return;

          setLoading(true);

          // Stop the scanner cleanly before calling the server action
          try {
            if (scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
              await scannerRef.current.stop();
            }
          } catch (_) { }
          setScanning(false);

          const response = await onScanSuccess(decodedText);

          // Play sounds based on success
          if (response.success) {
            new Audio('/success.mp3').play().catch(() => { });
          } else {
            new Audio('/error.mp3').play().catch(() => { });
          }

          setResult(response);
          setLoading(false);
        },
        (_errorMessage) => {
          // Ignored per-frame parse errors (camera looking for QR)
        }
      );
    } catch (err) {
      console.error(err);
      setResult({ success: false, message: "Não foi possível acessar a câmera." });
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current && scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
        await scannerRef.current.stop();
      }
    } catch (_) { }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
            scannerRef.current.stop().catch(() => { });
          }
        } catch (_) { }
      }
    };
  }, []);

  // Simply restart from scratch for next scan
  const resumeScanning = () => {
    setResult(null);
    setLoading(false);
    startScanning();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-4">
      {/* #reader MUST always stay mounted so Html5Qrcode can find the element on re-init */}
      <Card className={`w-full overflow-hidden bg-black rounded-3xl border border-white/10 relative ${result ? 'hidden' : 'block'}`}>
        <style>
          {`
            #reader video {
              object-fit: cover !important;
              width: 100% !important;
              height: 100% !important;
            }
            #reader {
              border: none !important;
            }
            #reader__scan_region {
              background: transparent !important;
            }
            #reader__dashboard {
              display: none !important;
            }
          `}
        </style>
        <div id="reader" className="w-full aspect-square bg-black"></div>
      </Card>

      {result && (
        <Card className={`w-full p-8 text-center flex flex-col items-center gap-5 rounded-3xl border-0 shadow-2xl ${result.success
          ? 'bg-green-500/10 border border-green-500/30'
          : 'bg-red-500/10 border border-red-500/30'
          }`}>
          {result.success ? (
            <CheckCircle2 className="w-24 h-24 text-green-400 animate-bounce" />
          ) : (
            <XCircle className="w-24 h-24 text-red-400 animate-pulse" />
          )}
          <h2 className={`text-3xl font-black tracking-tight ${result.success ? 'text-green-400' : 'text-red-400'
            }`}>
            {result.success ? "VALIDADO!" : "INVÁLIDO"}
          </h2>
          <p className="text-base font-medium text-zinc-300 leading-relaxed">{result.message}</p>
          <Button
            onClick={resumeScanning}
            className="w-full h-14 rounded-2xl text-lg font-semibold bg-white/10 hover:bg-white/20 text-white border-0 mt-2"
            disabled={loading}
          >
            {loading ? "Aguarde..." : "Escanear Próximo"}
          </Button>
        </Card>
      )}

      {!scanning && !result && (
        <Button onClick={startScanning} size="lg" className="w-full h-16 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)]">
          <Camera className="mr-2 h-6 w-6" /> Iniciar Scanner
        </Button>
      )}

      {scanning && !result && (
        <Button onClick={stopScanning} variant="destructive" size="lg" className="w-full h-14 rounded-2xl font-semibold">
          Parar Scanner
        </Button>
      )}
    </div>
  );
}
