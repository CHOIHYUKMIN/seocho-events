export class QueryEventDto {
    page?: number = 1;
    limit?: number = 20;
    district?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    targetAgeMin?: number;
    targetAgeMax?: number;
    isFree?: boolean;
    keyword?: string;
    sortBy?: 'latest' | 'date' | 'popular' = 'date';
}
