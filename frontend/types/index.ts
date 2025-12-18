// 타입 정의
export interface District {
    id: number;
    name: string;
    nameEn: string | null;
    code: string;
    eventCount: number;
}

export interface Event {
    id: number;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    registrationStartDate: string | null;
    registrationEndDate: string | null;
    location: string | null;
    address: string | null;
    districtId: number;
    targetAgeMin: number;
    targetAgeMax: number;
    targetGroup: string | null;
    capacity: number | null;
    isFree: boolean;
    fee: string | null;
    originalUrl: string;
    registrationUrl: string | null;
    imageUrl: string | null;
    category: string;
    organizer: string | null;
    contact: string | null;
    viewCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastSyncedAt: string;
    district: {
        id: number;
        name: string;
        nameEn: string | null;
        code: string;
    };
}

export interface Category {
    id: number;
    name: string;
    nameEn: string | null;
    icon: string | null;
    order: number;
}

export interface EventsResponse {
    data: Event[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface EventDetailResponse {
    data: Event;
    related: Event[];
}
