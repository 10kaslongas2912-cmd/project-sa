export interface DonorInterface {
    id?: number;
    firstname?: string;
    lastname?: string;
    phone?: string;
    email?: string;
    donor_type?: "user" | "guest";
    user_id?: number | null;
}


export interface DonationInterface {
    id?: number;
    donation_date?: Date;
    donation_type?: string;
    status?: string;
    description?: string;
    donor_id?: number;
}



export interface MoneyDonationInterface {
    id?: number
    amount?: number;
    payment_type?: "one-time" | "monthly";
    next_payment_date?: Date | string;
    billing_date?: string;
    transaction_ref?: string;
    status?: "success" | "complete";
    donation_id?: number;
    payment_method_id?: number;
}

export interface ItemDonationInterface {
    id?: number;
    item_name?: string;
    quantity?: number;
    unit?: string;
    item_ref?: string;
    donation_id?: number;
}

export interface CreateDonationRequest {
    user_id?: number;
    donor?: DonorInterface;
    donor_type: "user" | "guest";
    money_detail?: MoneyDonationInterface;
    item_detail?: ItemDonationInterface[];
}