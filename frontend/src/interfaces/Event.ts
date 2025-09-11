// Basic interfaces for related entities
export interface VisitBasicInfo {
    ID: number;
    visit_name: string;
    start_at: string;
    end_at: string;
}

export interface DogBasicInfo {
    ID: number;
    name: string;
}

export interface MedicalRecordBasicInfo {
    ID: number;
    date_record: string;
    symptoms: string;
    diagnosis: string;
    dog?: DogBasicInfo;
}

// Main Event interface for displaying full event details
export interface EventInterface {
    ID: number;
    name: string;
    description?: string;
    start_at: string;
    end_at: string;
    location?: string;
    organizer?: string;
    contact_info?: string;
    capacity?: number;
    image_url?: string;
    visit_id?: number;
    medical_record_id?: number;
    visit?: VisitBasicInfo;
    medical_record?: MedicalRecordBasicInfo;
    CreatedAt: string;
    UpdatedAt: string;
}

// Request interface for creating new event
export interface CreateEventRequest {
    name: string;
    description?: string;
    start_at: string; // "YYYY-MM-DDTHH:MM:SS"
    end_at: string;   // "YYYY-MM-DDTHH:MM:SS"
    location?: string;
    organizer?: string;
    contact_info?: string;
    capacity?: number;
    image_url?: string;
    visit_id?: number;
    medical_record_id?: number;
}

// Request interface for updating event
export interface UpdateEventRequest {
    name?: string;
    description?: string;
    start_at?: string;
    end_at?: string;
    location?: string;
    organizer?: string;
    contact_info?: string;
    capacity?: number;
    image_url?: string;
    visit_id?: number;
    medical_record_id?: number;
}

// Response interface for events with related data
export interface EventsWithRelatedDataResponse {
    events: EventInterface[];
    visits: VisitBasicInfo[];
    medical_records: MedicalRecordBasicInfo[];
}

// Interface for event form data (for admin management)
export interface EventFormData {
    name: string;
    description: string;
    startDate: string; // "YYYY-MM-DD"
    startTime: string; // "HH:MM"
    endDate: string;   // "YYYY-MM-DD"
    endTime: string;   // "HH:MM"
    location: string;
    organizer: string;
    contactInfo: string;
    capacity: number | string;
    imageFile: File | null;
    imageUrl: string;
    visitId: number | string;
    medicalRecordId: number | string;
}

// Interface for image upload response
export interface ImageUploadResponse {
    message: string;
    image_url: string;
    filename: string;
}

// Interface for pagination
export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        items_per_page: number;
    };
}