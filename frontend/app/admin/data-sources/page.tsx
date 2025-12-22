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
    config: string | null;
    lastCollectedAt: string | null;
    district: {
        id: number;
        name: string;
    };
    _count: {
        events: number;
    };
}

interface NewSourceForm {
    name: string;
    sourceType: 'API' | 'WEB_SCRAPING';
    url: string;
    districtId: number;
    config: any;
}

export default function AdminDataSourcesPage() {
    const [sources, setSources] = useState<DataSource[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSeoulApiModal, setShowSeoulApiModal] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [newSource, setNewSource] = useState<NewSourceForm>({
        name: '',
        sourceType: 'WEB_SCRAPING',
        url: '',
        districtId: 1, // 기본값: 서초구
        config: {},
    });

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
            setNewSource({
                ...newSource,
                url,
                config: res.data.data.suggested_config || {},
            });
        } catch (error: any) {
            alert(`분석 실패: ${error.response?.data?.message || error.message}`);
        } finally {
            setAnalyzing(false);
        }
    }

    async function saveNewSource() {
        try {
            await axios.post(`${API_URL}/admin/data-sources`, newSource);
            alert('데이터 소스가 성공적으로 등록되었습니다!');
            setShowAddModal(false);
            setAnalysis(null);
            setNewSource({
                name: '',
                sourceType: 'WEB_SCRAPING',
                url: '',
                districtId: 1,
                config: {},
            });
            fetchSources();
        } catch (error: any) {
            alert(`저장 실패: ${error.response?.data?.message || error.message}`);
        }
    }

    async function saveSeoulApiSource() {
        const apiKey = (document.getElementById('seoul-api-key') as HTMLInputElement)?.value;
        if (!apiKey) {
            alert('API 키를 입력해주세요.');
            return;
        }

        const seoulApiSource: NewSourceForm = {
            name: '서울 열린데이터 광장 (서초구)',
            sourceType: 'API',
            url: `http://openapi.seoul.go.kr:8088/${apiKey}/json/culturalEventInfo/1/100`,
            districtId: 1, // 서초구
            config: {
                apiKey,
                districtFilter: '서초구',
                timeout: 20000,
            },
        };

        try {
            await axios.post(`${API_URL}/admin/data-sources`, seoulApiSource);
            alert('서울 열린데이터 API가 성공적으로 등록되었습니다!');
            setShowSeoulApiModal(false);
            fetchSources();
        } catch (error: any) {
            alert(`저장 실패: ${error.response?.data?.message || error.message}`);
        }
    }

    async function testCrawling(id: number) {
        try {
            const res = await axios.post(`${API_URL}/admin/data-sources/${id}/test`);
            alert(`테스트 완료!\n${res.data.message}\n소스: ${res.data.source}`);
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        🌐 크롤링 사이트 관리
                    </h1>
                    <p className="text-gray-600">서초구 행사 정보를 수집할 데이터 소스를 관리합니다</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setShowSeoulApiModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center gap-2"
                    >
                        <span className="text-xl">🏛️</span>
                        서울 열린데이터 API 등록
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center gap-2"
                    >
                        <span className="text-xl">➕</span>
                        웹사이트 분석 및 추가
                    </button>
                </div>

                {/* 데이터 소스 목록 */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                        <h2 className="text-xl font-bold text-white">등록된 데이터 소스 ({sources.length}개)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">이름</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">URL</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">지역</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">타입</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">행사 수</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">상태</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">액션</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sources.map((source) => (
                                    <tr key={source.id} className="hover:bg-blue-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{source.name}</td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm truncate block max-w-xs"
                                            >
                                                {source.url}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{source.district.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${source.sourceType === 'API'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {source.sourceType === 'API' ? '🔌 API' : '🕷️ WEB'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-blue-600">{source._count.events}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleActive(source.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${source.isActive
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {source.isActive ? '✅ 활성' : '❌ 비활성'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => testCrawling(source.id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                                                >
                                                    🧪 테스트
                                                </button>
                                                <button
                                                    onClick={() => deleteSource(source.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    🗑️ 삭제
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 서울 API 등록 모달 */}
                {showSeoulApiModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
                            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                🏛️ 서울 열린데이터 API 등록
                            </h2>

                            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <h3 className="font-bold text-blue-800 mb-2">📌 API 키 발급 방법</h3>
                                <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                                    <li><a href="https://data.seoul.go.kr" target="_blank" className="text-blue-600 hover:underline">서울 열린데이터 광장</a> 접속</li>
                                    <li>로그인 후 상단 메뉴에서 "인증키 신청" 클릭</li>
                                    <li>발급받은 인증키를 아래에 입력</li>
                                </ol>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    API 인증키
                                </label>
                                <input
                                    type="text"
                                    id="seoul-api-key"
                                    placeholder="예: 545a4e4865687975313231706c5a7146"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                    defaultValue="545a4e4865687975313231706c5a7146"
                                />
                                <p className="text-xs text-gray-500 mt-1">* 서초구 행사만 필터링되어 수집됩니다</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={saveSeoulApiSource}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                                >
                                    ✅ API 등록하기
                                </button>
                                <button
                                    onClick={() => setShowSeoulApiModal(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 사이트 분석 및 추가 모달 */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                🔍 새 사이트 분석 및 추가
                            </h2>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    사이트 URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        id="url-input"
                                        placeholder="https://example.com/events"
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('url-input') as HTMLInputElement;
                                            analyzeSite(input.value);
                                        }}
                                        disabled={analyzing}
                                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 font-semibold"
                                    >
                                        {analyzing ? '🔄 분석 중...' : '🔍 분석'}
                                    </button>
                                </div>
                            </div>

                            {analysis && (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                                        <h3 className="font-bold text-green-800 text-lg mb-2">✅ 분석 완료!</h3>
                                        <p className="text-gray-700">페이지 제목: <span className="font-semibold">{analysis.title}</span></p>
                                    </div>

                                    {/* 소스 이름 입력 */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            데이터 소스 이름
                                        </label>
                                        <input
                                            type="text"
                                            value={newSource.name}
                                            onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                                            placeholder="예: 서초문화재단 행사"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                        <h3 className="font-bold text-blue-800 mb-3 text-lg">🎯 추천 설정</h3>
                                        <pre className="text-sm bg-white p-4 rounded-lg overflow-x-auto border border-gray-200 font-mono">
                                            {JSON.stringify(analysis.suggested_config, null, 2)}
                                        </pre>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <h3 className="font-bold text-gray-800 mb-3 text-lg">📊 샘플 데이터 (최대 5개)</h3>
                                        <div className="space-y-2">
                                            {analysis.sample_data.slice(0, 5).map((sample: any, i: number) => (
                                                <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                                                    <div className="text-sm text-gray-700 font-mono truncate">{sample.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={saveNewSource}
                                            disabled={!newSource.name}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold disabled:from-gray-400 disabled:to-gray-500"
                                        >
                                            ✅ 이 설정으로 저장
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAnalysis(null);
                                                setShowAddModal(false);
                                                setNewSource({
                                                    name: '',
                                                    sourceType: 'WEB_SCRAPING',
                                                    url: '',
                                                    districtId: 1,
                                                    config: {},
                                                });
                                            }}
                                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!analysis && (
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="mt-4 w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
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
