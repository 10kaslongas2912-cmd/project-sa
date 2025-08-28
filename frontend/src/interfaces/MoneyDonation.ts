export interface MoneyDonationInterface {
    money_id?: number;
    amount?: number;
    payment_type?: "one-time" | "monthly";
    next_payment_date?: Date | string;
    billing_date?: string;
    transaction_ref?: string;
    status?: "success" | "complete";
    donation_id?: number;
    payment_method_id?: number;
}