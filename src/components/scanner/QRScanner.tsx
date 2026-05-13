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
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }
      
      setResult(null);
      setScanning(true);
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (loading) return;
          
          setLoading(true);
          // Pause scanning while validating
          if (scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
             scannerRef.current.pause();
          }

          const response = await onScanSuccess(decodedText);
          
          // Play sounds based on success
          if (response.success) {
            new Audio('/success.mp3').play().catch(() => {});
          } else {
            new Audio('/error.mp3').play().catch(() => {});
          }

          setResult(response);
          setLoading(false);
        },
        (errorMessage) => {
          // Ignored parse errors
        }
      );
    } catch (err) {
      console.error(err);
      setResult({ success: false, message: "Could not access camera." });
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
      await scannerRef.current.stop();
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const resumeScanning = () => {
    setResult(null);
    if (scannerRef.current?.getState() === Html5QrcodeScannerState.PAUSED) {
      scannerRef.current.resume();
    } else {
      startScanning();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-4">
      {result ? (
        <Card className={`w-full p-6 text-center flex flex-col items-center space-y-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {result.success ? (
            <CheckCircle2 className="w-20 h-20 text-green-500 animate-bounce" />
          ) : (
            <XCircle className="w-20 h-20 text-red-500 animate-pulse" />
          )}
          <h2 className={`text-2xl font-bold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.success ? "VALIDADO COM SUCESSO" : "ERRO NA VALIDAÇÃO"}
          </h2>
          <p className="text-lg font-medium text-zinc-700">{result.message}</p>
          <Button onClick={resumeScanning} className="w-full mt-4" size="lg">
            Scan Next Ticket
          </Button>
        </Card>
      ) : (
        <Card className="w-full overflow-hidden bg-black rounded-xl">
          <div id="reader" className="w-full min-h-[300px] bg-black"></div>
        </Card>
      )}

      {!scanning && !result && (
        <Button onClick={startScanning} size="lg" className="w-full shadow-lg h-16 text-lg">
          <Camera className="mr-2 h-6 w-6" /> Start Scanner
        </Button>
      )}
      
      {scanning && !result && (
        <Button onClick={stopScanning} variant="destructive" size="lg" className="w-full">
          Stop Scanner
        </Button>
      )}
    </div>
  );
}
