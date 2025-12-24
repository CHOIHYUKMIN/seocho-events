'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import { eventsApi, categoriesApi } from '@/lib/api';
import { Event, Category } from '@/types';
import { useLocation } from '@/lib/LocationContext';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function EventsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentDistrict } = useLocation();

    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    // 필터 상태
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        isFree: searchParams.get('isFree') || '',
        targetAgeMax: searchParams.get('targetAgeMax') || '',
        dateFrom: searchParams.get('dateFrom') || '',
        dateTo: searchParams.get('dateTo') || '',
        keyword: searchParams.get('keyword') || '',
        sortBy: (searchParams.get('sortBy') as 'latest' | 'date' | 'popular') || 'date',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [currentDistrict, currentPage, filters]);

    async function fetchCategories() {
        try {
            const res = await categoriesApi.getAll();
            setCategories(res.data.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }

    async function fetchEvents() {
        setLoading(true);
        try {
            const params: any = {
                district: currentDistrict,
                page: currentPage,
                limit: 12,
            };

            if (filters.category) params.category = filters.category;
            if (filters.isFree) params.isFree = filters.isFree;
            if (filters.targetAgeMax) params.targetAgeMax = filters.targetAgeMax;
            if (filters.dateFrom) params.dateFrom = filters.dateFrom;
            if (filters.dateTo) params.dateTo = filters.dateTo;
            if (filters.keyword) params.keyword = filters.keyword;
            if (filters.sortBy) params.sortBy = filters.sortBy;

            const res = await eventsApi.getAll(params);
            setEvents(res.data.data);
            setTotal(res.data.meta.total);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    }

    function updateFilter(key: string, value: string) {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    }

    function clearFilters() {
        setFilters({
            category: '',
            isFree: '',
            targetAgeMax: '',
            dateFrom: '',
            dateTo: '',
            keyword: '',
            sortBy: 'date',
        });
        setCurrentPage(1);
    }

    const hasActiveFilters = Object.values(filters).some((v) => v && v !== 'date');

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">전체 행사</h1>
                    <p className="text-gray-600">총 {total}개의 행사가 있습니다</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* 사이드바 필터 */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900">필터</h2>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        초기화
                                    </button>
                                )}
                            </div>

                            {/* 카테고리 */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-700 mb-3">카테고리</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            value=""
                                            checked={filters.category === ''}
                                            onChange={(e) => updateFilter('category', e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-gray-700">전체</span>
                                    </label>
                                    {categories.map((cat) => (
                                        <label key={cat.id} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat.name}
                                                checked={filters.category === cat.name}
                                                onChange={(e) => updateFilter('category', e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-gray-700">
                                                {cat.icon} {cat.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 무료/유료 */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-700 mb-3">비용</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="isFree"
                                            value=""
                                            checked={filters.isFree === ''}
                                            onChange={(e) => updateFilter('isFree', e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-gray-700">전체</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="isFree"
                                            value="true"
                                            checked={filters.isFree === 'true'}
                                            onChange={(e) => updateFilter('isFree', e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-gray-700">🎁 무료만</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="isFree"
                                            value="false"
                                            checked={filters.isFree === 'false'}
                                            onChange={(e) => updateFilter('isFree', e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-gray-700">💰 유료만</span>
                                    </label>
                                </div>
                            </div>

                            {/* 대상 연령 */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-700 mb-3">대상</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="targetAge"
                                            value=""
                                            checked={filters.targetAgeMax === ''}
                                            onChange={(e) => updateFilter('targetAgeMax', e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-gray-700">전체</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="targetAge"
                                            value="13"
                                            checked={filters.targetAgeMax === '13'}
                                            onChange={(e) => updateFilter('targetAgeMax', e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-gray-700">👶 어린이 (0-13세)</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="targetAge"
                                            value="19"
                                            checked={filters.targetAgeMax === '19'}
                                            onChange={(e) => updateFilter('targetAgeMax', e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-gray-700">🧒 청소년 (14-19세)</span>
                                    </label>
                                </div>
                            </div>

                            {/* 정렬 */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-3">정렬</h3>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="date">가까운 날짜순</option>
                                    <option value="latest">최신 등록순</option>
                                    <option value="popular">인기순</option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* 행사 목록 */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-lg shadow-md p-6 h-64 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                        <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : events.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {events.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>

                                {/* 페이지네이션 */}
                                {total > 12 && (
                                    <div className="mt-8 flex justify-center gap-2">
                                        {currentPage > 1 && (
                                            <button
                                                onClick={() => setCurrentPage((p) => p - 1)}
                                                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                이전
                                            </button>
                                        )}
                                        <span className="px-4 py-2 bg-blue-600 text-white rounded-md">
                                            {currentPage}
                                        </span>
                                        {currentPage * 12 < total && (
                                            <button
                                                onClick={() => setCurrentPage((p) => p + 1)}
                                                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                다음
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <p className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</p>
                                <button
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    필터 초기화
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
