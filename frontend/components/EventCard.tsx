import Link from 'next/link';
import { Event } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    const startDate = new Date(event.startDate);
    const formattedDate = format(startDate, 'M월 d일 (E)', { locale: ko });
    const formattedTime = format(startDate, 'HH:mm');

    return (
        <Link href={`/events/${event.id}`}>
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full border border-gray-100">
                {/* 카테고리 배지 */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                        {event.category}
                    </span>
                    {event.isFree && (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                            무료
                        </span>
                    )}
                </div>

                {/* 제목 */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                </h3>

                {/* 설명 */}
                {event.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                    </p>
                )}

                {/* 정보 */}
                <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formattedDate} {formattedTime}</span>
                    </div>

                    {event.location && (
                        <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                    )}

                    {event.targetAgeMin > 0 || event.targetAgeMax < 999 ? (
                        <div className="flex items-center gap-2">
                            <span>👥</span>
                            <span>
                                {event.targetAgeMin > 0 && event.targetAgeMax < 999
                                    ? `${event.targetAgeMin}~${event.targetAgeMax}세`
                                    : event.targetAgeMin > 0
                                        ? `${event.targetAgeMin}세 이상`
                                        : `${event.targetAgeMax}세 이하`}
                            </span>
                        </div>
                    ) : null}
                </div>

                {/* 조회수 */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                    <span>{event.organizer || '서초구'}</span>
                    <span>👀 {event.viewCount}</span>
                </div>
            </div>
        </Link>
    );
}
