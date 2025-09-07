// src/hooks/sponsorship/types.ts
export type PlanType = "one-time" | "subscription";
export type Frequency = "monthly" | "quarterly" | "yearly";

export interface SponsorshipState {
  dogId: number | null;
  dogName?: string;
  planType: PlanType;
  frequency: Frequency | null;
  amount: number | null;
  paymentMethodId: number | null;
}

export interface SponsorshipActions {
  setDog(dogId: number, dogName?: string): void;
  setPlan(planType: PlanType): void;
  setFrequency(freq: Frequency | null): void;
  setAmount(amount: number | null): void;
  setPaymentMethod(methodId: number | null): void;
  reset(): void;

  validateForForm(): string | null;
  validateForPayment(): string | null;
  validateForFormDraft(draft?: Partial<SponsorshipState>): string | null;
}
