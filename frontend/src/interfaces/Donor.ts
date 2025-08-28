export interface DonorInterface {
    donor_id?: number;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    donor_type?: "user" | "guest";
    user_id?: number | null;
}