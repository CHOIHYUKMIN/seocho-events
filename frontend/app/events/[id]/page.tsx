'use client';

import { use, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import { eventsApi } from '@/lib/api';
import { Event } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';

export default function EventDetailPage() {
    const params = useParams();
    const id = parseInt(params.id as string);

    const [event, setEvent] = useState<Event | null>(null);
    const [related, setRelated] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchEvent();
            incrementView();
        }
    }, [id]);

    async function fetchEvent() {
        setLoading(true);
        try {
            const res = await eventsApi.getOne(id);
            setEvent(res.data.data);
            setRelated(res.data.related);
        } catch (error) {
            console.error('Failed to fetch event:', error);
        } finally {
            setLoading(false);
        }
    }

    async function incrementView() {
        try {
            await eventsApi.incrementView(id);
        } catch (error) {
            // 조회수 증가 실패는 무시
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">행사를 찾을 수 없습니다.</p>
                    </div>
                </main>
            </div>
        );
    }

    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* 메인 콘텐츠 */}
                    <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                        {/* 헤더 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-full">
                                {event.category}
                            </span>
                            {event.isFree && (
                                <span className="inline-block px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-full">
                                    무료
                                </span>
                            )}
                            <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
                                👀 {event.viewCount + 1}
                            </span>
                        </div>

                        {/* 제목 */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            {event.title}
                        </h1>

                        {/* 원본 페이지 링크 - 가장 중요! */}
                        <a
                            href={event.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-lg font-bold text-lg mb-8 transition-colors"
                        >
                            🔗 원본 페이지에서 자세히 보기 →
                        </a>

                        {/* 기본 정보 */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📅</span>
                                <div>
                                    <div className="font-semibold text-gray-900">일시</div>
                                    <div className="text-gray-700">
                                        {format(startDate, 'yyyy년 M월 d일 (E)', { locale: ko })}
                                        {event.startTime && (
                                            <span className="ml-2 font-semibold text-blue-600">
                                                {event.startTime}
                                                {event.endTime && ` ~ ${event.endTime}`}
                                            </span>
                                        )}
                                        {!event.startTime && endDate && (
                                            <span> ~ {format(endDate, 'HH:mm', { locale: ko })}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {event.location && (
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">📍</span>
                                    <div>
                                        <div className="font-semibold text-gray-900">장소</div>
                                        <div className="text-gray-700">{event.location}</div>
                                        {event.address && (
                                            <div className="text-sm text-gray-500">{event.address}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(event.targetAgeMin > 0 || event.targetAgeMax < 999) && (
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">👥</span>
                                    <div>
                                        <div className="font-semibold text-gray-900">대상</div>
                                        <div className="text-gray-700">
                                            {event.targetAgeMin > 0 && event.targetAgeMax < 999
                                                ? `${event.targetAgeMin}~${event.targetAgeMax}세`
                                                : event.targetAgeMin > 0
                                                    ? `${event.targetAgeMin}세 이상`
                                                    : `${event.targetAgeMax}세 이하`}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {event.capacity && (
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">🎫</span>
                                    <div>
                                        <div className="font-semibold text-gray-900">정원</div>
                                        <div className="text-gray-700">{event.capacity}명</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <span className="text-2xl">💰</span>
                                <div>
                                    <div className="font-semibold text-gray-900">참가비</div>
                                    <div className="text-gray-700">
                                        {event.isFree ? '무료' : event.fee || '유료'}
                                    </div>
                                </div>
                            </div>

                            {event.organizer && (
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">🏢</span>
                                    <div>
                                        <div className="font-semibold text-gray-900">주최</div>
                                        <div className="text-gray-700">{event.organizer}</div>
                                    </div>
                                </div>
                            )}

                            {event.contact && (
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">📞</span>
                                    <div>
                                        <div className="font-semibold text-gray-900">문의</div>
                                        <div className="text-gray-700">{event.contact}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 설명 */}
                        {event.description && (
                            <div className="border-t border-gray-200 pt-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">행사 소개</h2>
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                    {event.description}
                                </p>
                            </div>
                        )}

                        {/* 신청 링크 */}
                        {event.registrationUrl && (
                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">신청하기</h2>
                                {event.registrationStartDate && event.registrationEndDate && (
                                    <p className="text-gray-600 mb-4">
                                        신청 기간: {format(new Date(event.registrationStartDate), 'yyyy.M.d', { locale: ko })} ~ {format(new Date(event.registrationEndDate), 'yyyy.M.d', { locale: ko })}
                                    </p>
                                )}
                                <a
                                    href={event.registrationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    신청 페이지로 이동 →
                                </a>
                            </div>
                        )}
                    </div>

                    {/* 비슷한 행사 */}
                    {related.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">비슷한 행사</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {related.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
