import type { DogInterface } from "./Dog";
import type { ZoneInterface } from "./Zone";
export interface KennelInterface {
    id?: number;
    name?: string;
    capacity?: number;
    color?: string;
    note?: string | null;
    zones?: ZoneInterface[];
    dogs?: DogInterface[];
}
