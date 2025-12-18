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
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('preferredDistrict');
            if (saved) {
                setCurrentDistrictState(saved);
                setAutoDetected(true);
            }
        }
    }, []);

    const setCurrentDistrict = (district: string) => {
        setCurrentDistrictState(district);
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferredDistrict', district);
        }
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
