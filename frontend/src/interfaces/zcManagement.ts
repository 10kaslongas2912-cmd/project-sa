import type { KennelInterface } from "./Kennel";
import type { StaffInterface } from "./Staff";
import type { DogInterface } from "./Dog";


export interface ZcManagementInterface {
    kennel?: KennelInterface;
    dog?: DogInterface; 
    staff?: StaffInterface;
}

export interface UpdateZCManagementRequest {
    kennel?: Partial<KennelInterface>;
    dog?: Partial<DogInterface>;
    staff?: Partial<StaffInterface>;
}
