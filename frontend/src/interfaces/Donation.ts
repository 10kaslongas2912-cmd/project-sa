export interface DonorInterface {
    ID?: number;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    donor_type?: "user" | "guest";
    user_id?: number | null;
}


export interface DonationInterface {
    ID?: number;
    donation_date?: Date;
    donation_type?: string;
    status?: string;
    description?: string;
    donor_id?: number;
}



export interface MoneyDonationInterface {
    ID?: number
    amount?: number;
    payment_type?: "one-time" | "monthly";
    next_payment_date?: Date | string;
    billing_date?: string;
    transaction_ref?: string;
    status?: "success" | "complete";
    donation_id?: number;
    payment_method_id?: number;
}

export interface UnitInterface {
    ID?: number;
    name?: string;
}

export interface ItemInterface {
    ID?: number;
    name?: string;
}

export interface ItemDonationInterface {
    ID?: number;
    quantity?: number;
    item_ref?: string;
    donation_id?: number;
    item_id?: number;
    unit_id?: number;
    Item?: ItemInterface;
    Unit?: UnitInterface;
}

export interface CreateDonationRequest {
    donor_info: DonorInterface,
    donation_type: string,
    money_donation_details?: MoneyDonationInterface,
    item_donation_details?: ItemDonationInterface[]
}
