# 사용자 지역 자동 감지 및 필터링

## 개요

사용자의 위치를 자동으로 감지하여 해당 지역의 행사만 기본적으로 표시합니다.

---

## 구현 방법 (3단계)

### 1단계: 로컬스토리지 (MVP) ⭐
**장점**: 간단, 빠름, 개인정보 문제 없음  
**단점**: 수동 선택 필요

```typescript
// 사용자가 지역을 선택하면 저장
localStorage.setItem('preferredDistrict', 'seocho');

// 다음 방문 시 자동 적용
const savedDistrict = localStorage.getItem('preferredDistrict');
```

### 2단계: Geolocation API (Phase 2) 🌍
**장점**: 자동 감지, 정확함  
**단점**: 사용자 권한 필요

```typescript
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  // → 역지오코딩으로 "서초구" 확인
});
```

### 3단계: IP 기반 위치 (선택사항)
**장점**: 권한 불필요  
**단점**: 덜 정확, 외부 API 필요

---

## MVP 구현 (로컬스토리지 + 자동 적용)

### Frontend 구현

#### 1. Location Context (상태 관리)

```typescript
// frontend/lib/LocationContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationContextType {
  currentDistrict: string;
  setCurrentDistrict: (district: string) => void;
  autoDetected: boolean;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [currentDistrict, setCurrentDistrictState] = useState<string>('seocho');
  const [autoDetected, setAutoDetected] = useState(false);

  // 초기 로드 시 저장된 지역 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('preferredDistrict');
    if (saved) {
      setCurrentDistrictState(saved);
      setAutoDetected(true);
    }
  }, []);

  const setCurrentDistrict = (district: string) => {
    setCurrentDistrictState(district);
    localStorage.setItem('preferredDistrict', district);
  };

  return (
    <LocationContext.Provider value={{ currentDistrict, setCurrentDistrict, autoDetected }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}
```

#### 2. Root Layout에 Provider 추가

```typescript
// frontend/app/layout.tsx

import { LocationProvider } from '@/lib/LocationContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <LocationProvider>
          {children}
        </LocationProvider>
      </body>
    </html>
  );
}
```

#### 3. 행사 목록 페이지에서 자동 적용

```typescript
// frontend/app/events/page.tsx

'use client';

import { useLocation } from '@/lib/LocationContext';
import { useEffect, useState } from 'react';

export default function EventsPage() {
  const { currentDistrict } = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 지역의 행사 자동 로드
    fetchEvents();
  }, [currentDistrict]); // currentDistrict 변경 시 재로드

  async function fetchEvents() {
    setLoading(true);
    
    const params = new URLSearchParams({
      district: currentDistrict,
      page: '1',
      limit: '20',
    });
    
    const res = await fetch(`/api/events?${params}`);
    const data = await res.json();
    
    setEvents(data.data);
    setLoading(false);
  }

  return (
    <div>
      <h1>{currentDistrict === 'seocho' ? '서초구' : currentDistrict} 행사 목록</h1>
      {/* ... */}
    </div>
  );
}
```

#### 4. 지역 선택 컴포넌트 (나중에 여러 지역 추가 시)

```typescript
// frontend/components/DistrictSelector.tsx

'use client';

import { useLocation } from '@/lib/LocationContext';
import { useEffect, useState } from 'react';

interface District {
  id: number;
  name: string;
  code: string;
  eventCount: number;
}

export function DistrictSelector() {
  const { currentDistrict, setCurrentDistrict, autoDetected } = useLocation();
  const [districts, setDistricts] = useState<District[]>([]);

  useEffect(() => {
    // 활성화된 지역 목록 가져오기
    fetch('/api/districts')
      .then(res => res.json())
      .then(data => setDistricts(data.data));
  }, []);

  // MVP: 지역이 1개뿐이면 표시하지 않음
  if (districts.length <= 1) {
    return (
      <div className="text-sm text-gray-600">
        📍 {autoDetected ? '저장된 지역: ' : ''}서초구
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">📍 지역:</span>
      <select
        value={currentDistrict}
        onChange={(e) => setCurrentDistrict(e.target.value)}
        className="px-3 py-2 border rounded-lg"
      >
        {districts.map((d) => (
          <option key={d.code} value={d.code}>
            {d.name} ({d.eventCount}개)
          </option>
        ))}
      </select>
      {autoDetected && (
        <span className="text-xs text-green-600">✓ 자동 선택됨</span>
      )}
    </div>
  );
}
```

---

## Phase 2: Geolocation API (자동 감지)

### 위치 권한 요청 및 역지오코딩

```typescript
// frontend/lib/useGeolocation.ts

import { useState, useEffect } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('브라우저가 위치 정보를 지원하지 않습니다.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  };

  return { location, error, loading, requestLocation };
}
```

### 역지오코딩 (좌표 → 주소)

```typescript
// frontend/lib/geocoding.ts

interface GeocodingResult {
  district: string; // "서초구", "강남구" 등
  fullAddress: string;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult | null> {
  try {
    // Option 1: Kakao Maps API (국내 정확도 높음)
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_API_KEY}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.documents && data.documents.length > 0) {
      const address = data.documents[0].address;
      const district = address.region_2depth_name; // "서초구"
      
      return {
        district: mapDistrictNameToCode(district),
        fullAddress: address.address_name,
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

function mapDistrictNameToCode(districtName: string): string {
  const map: Record<string, string> = {
    '서초구': 'seocho',
    '강남구': 'gangnam',
    '송파구': 'songpa',
    // ... 더 추가
  };
  
  return map[districtName] || 'seocho'; // 기본값: 서초구
}
```

### 자동 감지 컴포넌트

```typescript
// frontend/components/AutoLocationDetector.tsx

'use client';

import { useEffect, useState } from 'react';
import { useLocation } from '@/lib/LocationContext';
import { useGeolocation } from '@/lib/useGeolocation';
import { reverseGeocode } from '@/lib/geocoding';

export function AutoLocationDetector() {
  const { setCurrentDistrict } = useLocation();
  const { location, requestLocation, loading, error } = useGeolocation();
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    // 자동 감지 시도 (첫 방문 시)
    const hasAskedBefore = localStorage.getItem('locationAsked');
    
    if (!hasAskedBefore) {
      const shouldAsk = confirm('현재 위치를 감지하여 가까운 지역의 행사를 보여드릴까요?');
      localStorage.setItem('locationAsked', 'true');
      
      if (shouldAsk) {
        requestLocation();
      }
    }
  }, []);

  useEffect(() => {
    if (location) {
      detectDistrict();
    }
  }, [location]);

  async function detectDistrict() {
    if (!location) return;

    const result = await reverseGeocode(location.latitude, location.longitude);
    
    if (result) {
      setCurrentDistrict(result.district);
      setDetected(true);
      
      // 성공 메시지
      alert(`${result.district}의 행사를 보여드립니다!`);
    }
  }

  // UI에 표시할 필요 없으면 null 반환
  return null;
}
```

---

## Backend API 변경사항

### GET /api/districts (활성화된 지역 목록)

```typescript
// backend/src/modules/districts/districts.controller.ts

@Controller('districts')
export class DistrictsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    const districts = await this.prisma.district.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { events: { where: { isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: districts.map(d => ({
        id: d.id,
        name: d.name,
        nameEn: d.nameEn,
        code: d.code,
        eventCount: d._count.events,
      })),
    };
  }
}
```

### GET /api/events (지역 필터 자동 적용)

```typescript
// backend/src/modules/events/events.controller.ts

@Get()
async findAll(@Query() query: QueryEventDto) {
  const { district = 'seocho', ...otherFilters } = query;
  
  // district가 없으면 기본값 'seocho' 사용
  
  const events = await this.eventsService.findAll({
    district,
    ...otherFilters,
  });
  
  return { data: events };
}
```

---

## UI 자동 적용 플로우

### 첫 방문 (위치 권한 요청)

```
┌─────────────────────────────────────┐
│  서초구 행사/이벤트 플랫폼          │
├─────────────────────────────────────┤
│                                     │
│  📍 현재 위치를 감지하여            │
│     가까운 지역의 행사를            │
│     보여드릴까요?                   │
│                                     │
│   [ 허용 ]    [ 나중에 ]           │
│                                     │
└─────────────────────────────────────┘
```

### 위치 감지 성공

```
┌─────────────────────────────────────┐
│  📍 서초구의 행사를 보여드립니다!   │
│  ✓ 자동으로 선택되었습니다          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [이번 주말] [어린이] [무료] [문화] │
├─────────────────────────────────────┤
│  📅 12월 25일 - 서초 크리스마스 축제 │
│  📅 12월 26일 - 가족 음악회          │
│  ...                                │
└─────────────────────────────────────┘
```

### 다음 방문 (자동 적용)

```
localStorage에서 'seocho' 불러옴
→ 자동으로 서초구 행사만 표시
→ 사용자는 아무것도 선택할 필요 없음
```

---

## 개인정보 보호

### 수집하지 않는 정보
- ❌ 정확한 GPS 좌표
- ❌ 집 주소
- ❌ 서버에 위치 정보 저장

### 수집하는 정보
- ✅ 선택한 지역 코드 (로컬스토리지에만)
- ✅ 브라우저에만 저장 (서버 전송 없음)

### 사용자 권한
- 사용자가 직접 지역 변경 가능
- 위치 권한 거부 가능
- 로컬스토리지 삭제 가능

---

## 구현 우선순위

### MVP (Sprint 2)
1. ✅ **로컬스토리지 기반** 지역 저장
2. ✅ 다음 방문 시 자동 적용
3. ✅ 수동 지역 변경 가능

### Phase 2 (나중에)
1. 🔮 Geolocation API 자동 감지
2. 🔮 Kakao Maps 역지오코딩
3. 🔮 "내 위치 감지" 버튼

---

## 코드 위치 요약

```
frontend/
├── lib/
│   ├── LocationContext.tsx      # ✅ MVP: 지역 상태 관리
│   ├── useGeolocation.ts        # 🔮 Phase 2: 위치 감지
│   └── geocoding.ts             # 🔮 Phase 2: 역지오코딩
│
├── components/
│   ├── DistrictSelector.tsx     # ✅ MVP: 지역 선택 UI
│   └── AutoLocationDetector.tsx # 🔮 Phase 2: 자동 감지
│
└── app/
    ├── layout.tsx               # LocationProvider 추가
    └── events/page.tsx          # 지역 필터 자동 적용

backend/
├── src/modules/
│   ├── districts/
│   │   └── districts.controller.ts  # 지역 목록 API
│   └── events/
│       └── events.controller.ts     # district 기본값 처리
```

---

## 테스트 시나리오

### 1. 첫 방문 (저장된 지역 없음)
- [x] 기본적으로 서초구 행사 표시
- [x] 로컬스토리지에 'seocho' 자동 저장

### 2. 재방문 (저장된 지역 있음)
- [x] 저장된 지역 자동 불러오기
- [x] 해당 지역 행사 자동 표시

### 3. 지역 변경
- [x] 드롭다운에서 다른 지역 선택
- [x] 로컬스토리지 업데이트
- [x] 행사 목록 즉시 재로드

### 4. 로컬스토리지 삭제 후
- [x] 기본값(서초구)으로 복귀
- [x] 정상 작동

---

**작성일**: 2025-12-17  
**구현 시기**: Sprint 2 (행사 UI 개발 시)  
**우선순위**: MVP = 로컬스토리지, Phase 2 = Geolocation
