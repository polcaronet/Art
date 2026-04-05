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
      body: JSON.stringify({ amount, description, email, orderId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao gerar Pix');
    }
    return res.json();
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
      body: JSON.stringify({ amount, description, orderId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar sessão Stripe');
    }
    return res.json();
  }
}
