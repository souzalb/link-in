import { createAdminClient } from "@/utils/supabase/admin";
import { DigitalTicket } from "@/components/ticket/DigitalTicket";
import { notFound } from "next/navigation";

export default async function GuestTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Usamos o admin client para ler o ticket pelo ID único (UUID), contornando o RLS.
  // Como o UUID é impossível de adivinhar, a própria URL serve como token de acesso.
  const adminClient = createAdminClient();

  const { data: ticket, error } = await adminClient
    .from("tickets")
    .select(`
      id, guest_name, guest_email, status, qr_token,
      events (
        title, date, location, banner_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !ticket) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent"></div>
      
      <div className="relative z-10 w-full max-w-sm">
         <DigitalTicket ticket={ticket as any} />
      </div>
    </div>
  );
}
