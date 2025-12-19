'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface DataSource {
    id: number;
    name: string;
    url: string;
    sourceType: string;
    isActive: boolean;
    crawlerConfig: string | null;
    lastCollectedAt: string | null;
    district: {
        name: string;
    };
    _count: {
        events: number;
    };
}

export default function AdminDataSourcesPage() {
    const [sources, setSources] = useState<DataSource[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => {
        fetchSources();
    }, []);

    async function fetchSources() {
        try {
            const res = await axios.get(`${API_URL}/admin/data-sources`);
            setSources(res.data.data);
        } catch (error) {
            console.error('Failed to fetch sources:', error);
        }
    }

    async function analyzeSite(url: string) {
        setAnalyzing(true);
        try {
            const res = await axios.post(`${API_URL}/admin/data-sources/analyze`, { url });
            setAnalysis(res.data.data);
        } catch (error: any) {
            alert(`분석 실패: ${error.response?.data?.message || error.message}`);
        } finally {
            setAnalyzing(false);
        }
    }

    async function testCrawling(id: number) {
        try {
            const res = await axios.post(`${API_URL}/admin/data-sources/${id}/test`);
            alert(`테스트 성공!\n${res.data.count}개 항목 발견`);
            console.log('테스트 결과:', res.data);
        } catch (error: any) {
            alert(`테스트 실패: ${error.message}`);
        }
    }

    async function toggleActive(id: number) {
        try {
            await axios.post(`${API_URL}/admin/data-sources/${id}/toggle`);
            fetchSources();
        } catch (error) {
            alert('활성화 토글 실패');
        }
    }

    async function deleteSource(id: number) {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            await axios.delete(`${API_URL}/admin/data-sources/${id}`);
            fetchSources();
        } catch (error) {
            alert('삭제 실패');
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">크롤링 사이트 관리</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        + 사이트 추가
                    </button>
                </div>

                {/* 데이터 소스 목록 */}
                <div className="bg-white rounded-lg shadow">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">지역</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">행사 수</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sources.map((source) => (
                                <tr key={source.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{source.name}</td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline text-sm truncate block max-w-xs"
                                        >
                                            {source.url}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">{source.district.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded bg-gray-100">
                                            {source.sourceType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{source._count.events}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleActive(source.id)}
                                            className={`px-3 py-1 rounded text-sm ${source.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {source.isActive ? '활성' : '비활성'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => testCrawling(source.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                테스트
                                            </button>
                                            <button
                                                onClick={() => deleteSource(source.id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 사이트 추가 모달 */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">새 사이트 분석</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    사이트 URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        id="url-input"
                                        placeholder="https://example.com/events"
                                        className="flex-1 px-4 py-2 border rounded-lg"
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('url-input') as HTMLInputElement;
                                            analyzeSite(input.value);
                                        }}
                                        disabled={analyzing}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        {analyzing ? '분석 중...' : '분석'}
                                    </button>
                                </div>
                            </div>

                            {analysis && (
                                <div className="mt-6 space-y-4">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h3 className="font-bold text-green-800">✅ 분석 완료!</h3>
                                        <p className="text-sm text-gray-600">제목: {analysis.title}</p>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-bold mb-2">🎯 추천 설정</h3>
                                        <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                                            {JSON.stringify(analysis.suggested_config, null, 2)}
                                        </pre>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-bold mb-2">📊 샘플 데이터 (5개)</h3>
                                        {analysis.sample_data.map((sample: any, i: number) => (
                                            <div key={i} className="mb-2 p-2 bg-white rounded text-xs">
                                                <div className="font-mono truncate">{sample.text}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                                            이 설정으로 저장
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAnalysis(null);
                                                setShowAddModal(false);
                                            }}
                                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!analysis && (
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="mt-4 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                                >
                                    닫기
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
