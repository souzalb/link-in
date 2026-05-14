"use client";

import { validateTicket } from "./actions";
import { QRScanner } from "@/components/scanner/QRScanner";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function ScannerPage() {
  const handleScanSuccess = async (decodedText: string) => {
    // Basic format validation if it's a URL or pure UUID. 
    // Assuming the QR contains just the UUID, or a URL ending with the UUID.
    let qrToken = decodedText;
    try {
      // If it's a URL, extract the last part
      const url = new URL(decodedText);
      const parts = url.pathname.split("/");
      qrToken = parts[parts.length - 1];
    } catch {
      // If it's not a URL, assume it's the raw UUID
    }

    return await validateTicket(qrToken);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col p-4 md:p-8 relative">
      <header className="flex items-center justify-between mb-8 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Controle de Acesso</h1>
          <p className="text-sm text-zinc-400">Escaneie os ingressos digitais</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <QRScanner onScanSuccess={handleScanSuccess} />
      </main>

      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
}
