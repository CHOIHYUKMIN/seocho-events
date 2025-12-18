import Link from 'next/link';

export default function Header() {
    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🎉</span>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">서초구 행사/이벤트</h1>
                            <p className="text-xs text-gray-500">우리 동네 행사 한눈에</p>
                        </div>
                    </Link>

                    <nav className="hidden md:flex gap-6">
                        <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                            홈
                        </Link>
                        <Link href="/events" className="text-gray-600 hover:text-gray-900 font-medium">
                            전체 행사
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
