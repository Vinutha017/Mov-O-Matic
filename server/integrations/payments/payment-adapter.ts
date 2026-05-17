import { randomUUID } from "crypto";

export interface PaymentCaptureInput {
  bookingId: string;
  amount: number;
  currency: string;
  method: string;
  idempotencyKey?: string;
}

export interface PaymentCaptureResult {
  providerPaymentId: string;
  status: "captured" | "authorized";
  receiptUrl: string;
  metadata: Record<string, unknown>;
}

export const mockPaymentGateway = {
  async capturePayment(input: PaymentCaptureInput): Promise<PaymentCaptureResult> {
    const paymentId = `pay_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

    return {
      providerPaymentId: paymentId,
      status: "captured",
      receiptUrl: `https://payments.planora.local/receipts/${paymentId}`,
      metadata: {
        bookingId: input.bookingId,
        amount: input.amount,
        currency: input.currency,
        method: input.method,
        idempotencyKey: input.idempotencyKey ?? null
      }
    };
  }
};