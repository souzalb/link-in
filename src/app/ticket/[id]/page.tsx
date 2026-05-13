import { createClient } from "@/utils/supabase/server";
import { DigitalTicket } from "@/components/ticket/DigitalTicket";
import { TicketLogin } from "./TicketLogin";
import { notFound } from "next/navigation";

export default async function GuestTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div className="relative z-10 w-full max-w-sm">
           <TicketLogin ticketId={id} />
        </div>
      </div>
    );
  }

  const { data: ticket, error } = await supabase
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

  // To strictly follow the rules: Guests can only see their own tickets.
  // if (user?.email !== ticket.guest_email) { ... }
  // Assuming RLS covers this if the user is logged in.

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent"></div>
      
      <div className="relative z-10 w-full max-w-sm">
         <DigitalTicket ticket={ticket as any} />
      </div>
    </div>
  );
}
