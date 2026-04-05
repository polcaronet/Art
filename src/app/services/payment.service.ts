import { Injectable } from '@angular/core';

export interface PixPayment {
  id: number;
  status: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
}

export interface StripeSession {
  sessionId: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiBase = 'https://webart-backend-polcaronet9724-1mowec7v.leapcell.dev/api';

  async createPix(amount: number, description: string, email: string, orderId: string): Promise<PixPayment> {
    const res = await fetch(`${this.apiBase}/pix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description, email, order_id: orderId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || err.error || 'Erro ao gerar Pix');
    }
    const data = await res.json();
    return {
      id: data.id,
      status: data.status,
      qrCode: data.qr_code,
      qrCodeBase64: data.qr_code_base64,
      ticketUrl: data.ticket_url,
    };
  }

  async checkPixStatus(paymentId: number): Promise<{ status: string }> {
    const res = await fetch(`${this.apiBase}/pix-status?id=${paymentId}`);
    if (!res.ok) throw new Error('Erro ao verificar status');
    return res.json();
  }

  async createStripeSession(amount: number, description: string, orderId: string): Promise<StripeSession> {
    const res = await fetch(`${this.apiBase}/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description, order_id: orderId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || err.error || 'Erro ao criar sessão Stripe');
    }
    const data = await res.json();
    return {
      sessionId: data.session_id,
      url: data.url,
    };
  }
}
