"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Ticket, Calendar, MapPin, User, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DigitalTicketProps {
  ticket: {
    id: string;
    guest_name: string;
    status: string;
    qr_token: string;
    events: {
      title: string;
      date: string;
      location: string;
      banner_url?: string;
    };
  };
}

export function DigitalTicket({ ticket }: DigitalTicketProps) {
  const isUsed = ticket.status === "checked_in";
  const isRevoked = ticket.status === "revoked";

  return (
    <div className="w-full max-w-sm mx-auto relative group">
      {/* Decorative shadows */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-90 group-hover:bg-primary/30 transition-colors duration-500"></div>
      
      <Card className="relative w-full overflow-hidden border-0 shadow-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 text-white rounded-[2rem] h-[600px] flex flex-col">
        {/* Header / Banner */}
        <div className="h-48 bg-zinc-800 relative w-full shrink-0">
          {ticket.events.banner_url ? (
            <img src={ticket.events.banner_url} alt="Event Banner" className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-primary/80 to-primary/40 flex items-center justify-center">
               <Ticket className="w-16 h-16 text-white/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
          
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl font-bold leading-tight line-clamp-2 drop-shadow-md">
              {ticket.events.title}
            </h2>
          </div>
        </div>

        {/* Info Section */}
        <div className="px-6 py-6 space-y-4 flex-1">
          <div className="flex items-start gap-3 text-zinc-300">
            <User className="w-5 h-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Guest</p>
              <p className="font-medium text-white">{ticket.guest_name}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-zinc-300">
            <Calendar className="w-5 h-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Date & Time</p>
              <p className="font-medium text-white">{new Date(ticket.events.date).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {ticket.events.location && (
            <div className="flex items-start gap-3 text-zinc-300">
              <MapPin className="w-5 h-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Location</p>
                <p className="font-medium text-white line-clamp-2">{ticket.events.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Dotted separator */}
        <div className="relative h-8 flex items-center justify-between w-full px-0 shrink-0">
          <div className="w-6 h-6 rounded-full bg-zinc-50 absolute -left-3 shadow-inner"></div>
          <div className="flex-1 border-t-2 border-dashed border-zinc-700 mx-4"></div>
          <div className="w-6 h-6 rounded-full bg-zinc-50 absolute -right-3 shadow-inner"></div>
        </div>

        {/* QR Code Section */}
        <div className="px-6 pb-8 pt-4 flex flex-col items-center justify-center shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-inner relative">
             {isUsed && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl text-green-600">
                   <CheckCircle className="w-12 h-12 mb-2" />
                   <span className="font-bold">UTILIZADO</span>
                </div>
             )}
             {isRevoked && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl text-red-600">
                   <span className="font-bold text-xl uppercase text-center leading-tight">Cancelado</span>
                </div>
             )}
             <QRCodeCanvas
                value={ticket.qr_token}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="Q"
                className={isUsed || isRevoked ? "opacity-30" : ""}
             />
          </div>
          <p className="mt-4 text-xs font-mono text-zinc-500 text-center uppercase tracking-[0.2em]">
             {ticket.qr_token.split('-')[0]}
          </p>
        </div>
      </Card>
    </div>
  );
}
