import type { KennelInterface } from "./Kennel";
import type { AppStaffInterface } from "./Staff";
import type { DogInterface } from "./Dog";


export interface ZcManagementInterface {
    kennel?: KennelInterface;
    dog?: DogInterface; 
    staff?: AppStaffInterface;
    action: string;
}

export interface UpdateZCManagementRequest {
    kennel?: Partial<KennelInterface>;
    dog?: Partial<DogInterface>;
    staff?: Partial<AppStaffInterface>;
    action: string;
}
