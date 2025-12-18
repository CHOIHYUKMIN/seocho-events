'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import { eventsApi, categoriesApi } from '@/lib/api';
import { Event, Category } from '@/types';
import { useLocation } from '@/lib/LocationContext';

export default function Home() {
  const { currentDistrict } = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentDistrict]);

  async function fetchData() {
    setLoading(true);
    try {
      const [eventsRes, categoriesRes] = await Promise.all([
        eventsApi.getAll({ district: currentDistrict, limit: 6, sortBy: 'date' }),
        categoriesApi.getAll(),
      ]);

      setEvents(eventsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const quickFilters = [
    { label: '이번 주말', icon: '📅', href: '/events?dateFrom=2025-12-21&dateTo=2025-12-22' },
    { label: '어린이', icon: '👶', href: '/events?targetAgeMax=13' },
    { label: '무료', icon: '🎁', href: '/events?isFree=true' },
    { label: '문화', icon: '🎭', href: '/events?category=문화' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              서초구의 모든 행사, 한눈에
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              우리 동네에서 열리는 다양한 행사를 쉽게 찾아보세요
            </p>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {quickFilters.map((filter) => (
                <Link
                  key={filter.label}
                  href={filter.href}
                  className="bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-md"
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 다가오는 행사 */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">다가오는 행사</h2>
            <Link
              href="/events"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              전체보기 <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 h-64 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">등록된 행사가 없습니다.</p>
            </div>
          )}
        </section>

        {/* 카테고리 */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">카테고리별 행사</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/events?category=${category.name}`}
                  className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-6 text-center transition-all group"
                >
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                    {category.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-300">서초구 행사/이벤트 플랫폼</p>
            <p className="text-gray-400 text-sm mt-2">
              매일 자동으로 최신 행사 정보를 수집합니다
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
