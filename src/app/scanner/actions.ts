"use server";

import { createClient } from "@/utils/supabase/server";

export async function validateTicket(qrToken: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    // 1. Verify user is a scanner (optional if middleware handles it, but good for defense-in-depth)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "Acesso negado: Usuário não autenticado." };
    }

    // 2. Fetch the ticket using the qr_token
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*, events(title)")
      .eq("qr_token", qrToken)
      .single();

    if (ticketError || !ticket) {
      return { success: false, message: "Ingresso não encontrado ou token inválido." };
    }

    if (ticket.status === 'revoked') {
      return { success: false, message: "INGRESSO CANCELADO/REVOGADO." };
    }

    // 3. Fraud Prevention: Check if already checked in
    if (ticket.status === "checked_in") {
      const time = new Date(ticket.checked_in_at).toLocaleString("pt-BR", { timeZone: 'America/Sao_Paulo' });
      return { success: false, message: `INGRESSO JÁ UTILIZADO em ${time}.` };
    }

    // 4. Update the ticket to checked_in
    const { error: updateError } = await supabase
      .from("tickets")
      .update({
        status: "checked_in",
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", ticket.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return { success: false, message: "Erro ao atualizar status do ingresso." };
    }

    const eventTitle = ticket.events?.title || "Evento";
    return { success: true, message: `Check-in realizado para ${ticket.guest_name} (${eventTitle}).` };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Erro interno no servidor." };
  }
}
