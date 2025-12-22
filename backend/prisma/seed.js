"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var seocho, categories, _i, categories_1, cat, dataSources, _a, dataSources_1, ds, sampleEvents, _b, sampleEvents_1, event_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🌱 Seeding database...');
                    return [4 /*yield*/, prisma.district.upsert({
                            where: { code: 'seocho' },
                            update: {},
                            create: {
                                name: '서초구',
                                nameEn: 'Seocho-gu',
                                code: 'seocho',
                                isActive: true,
                            },
                        })];
                case 1:
                    seocho = _c.sent();
                    return [4 /*yield*/, prisma.district.upsert({
                            where: { code: 'gangnam' },
                            update: {},
                            create: {
                                name: '강남구',
                                nameEn: 'Gangnam-gu',
                                code: 'gangnam',
                                isActive: false,
                            },
                        })];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, prisma.district.upsert({
                            where: { code: 'songpa' },
                            update: {},
                            create: {
                                name: '송파구',
                                nameEn: 'Songpa-gu',
                                code: 'songpa',
                                isActive: false,
                            },
                        })];
                case 3:
                    _c.sent();
                    console.log('✅ Districts created');
                    categories = [
                        { name: '문화', nameEn: 'Culture', icon: '🎭', order: 1 },
                        { name: '체육', nameEn: 'Sports', icon: '⚽', order: 2 },
                        { name: '교육', nameEn: 'Education', icon: '📚', order: 3 },
                        { name: '축제', nameEn: 'Festival', icon: '🎉', order: 4 },
                        { name: '행정', nameEn: 'Administration', icon: '🏛️', order: 5 },
                        { name: '복지', nameEn: 'Welfare', icon: '🤝', order: 6 },
                    ];
                    _i = 0, categories_1 = categories;
                    _c.label = 4;
                case 4:
                    if (!(_i < categories_1.length)) return [3 /*break*/, 7];
                    cat = categories_1[_i];
                    return [4 /*yield*/, prisma.category.upsert({
                            where: { name: cat.name },
                            update: {},
                            create: cat,
                        })];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    console.log('✅ Categories created');
                    dataSources = [
                        {
                            name: '서울 열린데이터 광장 (서초구)',
                            sourceType: 'API',
                            url: 'http://openapi.seoul.go.kr:8088/545a4e4865687975313231706c5a7146/json/culturalEventInfo/1/100',
                            districtId: seocho.id,
                            config: JSON.stringify({
                                apiKey: '545a4e4865687975313231706c5a7146',
                                districtFilter: '서초구',
                                timeout: 20000,
                            }),
                        },
                        {
                            name: '서초구청 공지사항',
                            sourceType: 'WEB_SCRAPING',
                            url: 'https://www.seocho.go.kr/site/seocho/07/10701020000002015041501.jsp',
                            districtId: seocho.id,
                            config: JSON.stringify({
                                method: 'static',
                                selector: '.board-list tr',
                                titleSelector: '.title',
                                dateSelector: '.date',
                            }),
                        },
                        {
                            name: '서초문화재단',
                            sourceType: 'WEB_SCRAPING',
                            url: 'https://www.seochocf.or.kr',
                            districtId: seocho.id,
                            config: JSON.stringify({
                                method: 'dynamic',
                                waitForSelector: '.event-list',
                            }),
                        },
                        {
                            name: '서초여성가족플라자',
                            sourceType: 'WEB_SCRAPING',
                            url: 'https://women.seocho.go.kr',
                            districtId: seocho.id,
                            config: JSON.stringify({
                                method: 'static',
                            }),
                        },
                        {
                            name: '서초구립도서관',
                            sourceType: 'WEB_SCRAPING',
                            url: 'https://seocholib.or.kr',
                            districtId: seocho.id,
                            config: JSON.stringify({
                                method: 'static',
                            }),
                        },
                    ];
                    _a = 0, dataSources_1 = dataSources;
                    _c.label = 8;
                case 8:
                    if (!(_a < dataSources_1.length)) return [3 /*break*/, 11];
                    ds = dataSources_1[_a];
                    return [4 /*yield*/, prisma.dataSource.create({
                            data: ds,
                        })];
                case 9:
                    _c.sent();
                    _c.label = 10;
                case 10:
                    _a++;
                    return [3 /*break*/, 8];
                case 11:
                    console.log('✅ Data sources created');
                    sampleEvents = [
                        {
                            title: '서초 가족 문화축제',
                            description: '서초구민이 함께하는 겨울 문화축제입니다. 다양한 공연과 체험 프로그램이 준비되어 있습니다.',
                            startDate: new Date('2025-12-25T10:00:00'),
                            endDate: new Date('2025-12-25T18:00:00'),
                            location: '서초구청 앞 광장',
                            address: '서울시 서초구 서초대로 2584',
                            districtId: seocho.id,
                            targetAgeMin: 0,
                            targetAgeMax: 999,
                            targetGroup: JSON.stringify(['가족', '어린이']),
                            isFree: true,
                            originalUrl: 'https://www.seocho.go.kr/event/festival2025',
                            category: '축제',
                            organizer: '서초구청 문화체육과',
                            contact: '02-2155-6743',
                        },
                        {
                            title: '어린이 독서 교실',
                            description: '초등학생을 위한 겨울방학 독서 프로그램입니다.',
                            startDate: new Date('2026-01-10T14:00:00'),
                            endDate: new Date('2026-01-10T16:00:00'),
                            registrationStartDate: new Date('2025-12-20T00:00:00'),
                            registrationEndDate: new Date('2026-01-05T23:59:00'),
                            location: '서초구립반포도서관',
                            address: '서울시 서초구 신반포로 201',
                            districtId: seocho.id,
                            targetAgeMin: 7,
                            targetAgeMax: 13,
                            targetGroup: JSON.stringify(['어린이']),
                            capacity: 30,
                            isFree: true,
                            originalUrl: 'https://seocholib.or.kr/program/123',
                            registrationUrl: 'https://seocholib.or.kr/apply/123',
                            category: '교육',
                            organizer: '서초구립반포도서관',
                            contact: '02-535-4142',
                        },
                        {
                            title: '서리풀 클래식 콘서트',
                            description: '클래식 명곡을 무료로 감상하는 시민 음악회입니다.',
                            startDate: new Date('2026-01-15T19:00:00'),
                            endDate: new Date('2026-01-15T21:00:00'),
                            registrationStartDate: new Date('2025-12-25T09:00:00'),
                            registrationEndDate: new Date('2026-01-10T18:00:00'),
                            location: '서초문화예술회관',
                            address: '서울시 서초구 남부순환로 2406',
                            districtId: seocho.id,
                            targetAgeMin: 0,
                            targetAgeMax: 999,
                            targetGroup: JSON.stringify(['성인', '가족']),
                            capacity: 500,
                            isFree: true,
                            originalUrl: 'https://www.seochocf.or.kr/event/concert2026',
                            registrationUrl: 'https://www.seochocf.or.kr/apply/concert2026',
                            category: '문화',
                            organizer: '서초문화재단',
                            contact: '02-2155-8645',
                        },
                        {
                            title: '서초청년 취업특강',
                            description: '청년을 위한 취업 준비 및 면접 스킬 특강입니다.',
                            startDate: new Date('2026-01-08T14:00:00'),
                            endDate: new Date('2026-01-08T17:00:00'),
                            registrationStartDate: new Date('2025-12-20T00:00:00'),
                            registrationEndDate: new Date('2026-01-05T23:59:00'),
                            location: '서초여성가족플라자',
                            address: '서울시 서초구 반포대로 18길 34',
                            districtId: seocho.id,
                            targetAgeMin: 19,
                            targetAgeMax: 39,
                            targetGroup: JSON.stringify(['청년']),
                            capacity: 50,
                            isFree: true,
                            originalUrl: 'https://women.seocho.go.kr/program/job2026',
                            category: '교육',
                            organizer: '서초구 일자리경제과',
                            contact: '02-2155-8856',
                        },
                        {
                            title: '서초 구민 건강달리기',
                            description: '건강한 새해를 위한 5km 구민 달리기 대회입니다.',
                            startDate: new Date('2026-01-20T08:00:00'),
                            endDate: new Date('2026-01-20T12:00:00'),
                            registrationStartDate: new Date('2025-12-15T00:00:00'),
                            registrationEndDate: new Date('2026-01-15T23:59:00'),
                            location: '양재천 체육공원',
                            address: '서울시 서초구 양재천로 71',
                            districtId: seocho.id,
                            targetAgeMin: 15,
                            targetAgeMax: 999,
                            targetGroup: JSON.stringify(['성인', '청소년']),
                            capacity: 200,
                            isFree: true,
                            originalUrl: 'https://www.seocho.go.kr/sports/running2026',
                            registrationUrl: 'https://www.seocho.go.kr/apply/running2026',
                            category: '체육',
                            organizer: '서초구청 체육진흥과',
                            contact: '02-2155-6945',
                        },
                        {
                            title: '반포 한강공원 벚꽃축제',
                            description: '봄을 맞이하는 벚꽃 축제와 다양한 문화 공연이 준비되어 있습니다.',
                            startDate: new Date('2026-04-05T10:00:00'),
                            endDate: new Date('2026-04-07T20:00:00'),
                            location: '반포 한강공원',
                            address: '서울시 서초구 신반포로 11',
                            districtId: seocho.id,
                            targetAgeMin: 0,
                            targetAgeMax: 999,
                            targetGroup: JSON.stringify(['가족', '성인', '어린이']),
                            isFree: true,
                            originalUrl: 'https://www.seocho.go.kr/festival/cherry2026',
                            category: '축제',
                            organizer: '서초구청 문화체육과',
                            contact: '02-2155-6743',
                        },
                        {
                            title: '유아 놀이 프로그램',
                            description: '만 3-5세 유아를 위한 창의적 놀이 활동입니다.',
                            startDate: new Date('2026-01-13T10:00:00'),
                            endDate: new Date('2026-01-13T11:30:00'),
                            registrationStartDate: new Date('2025-12-23T09:00:00'),
                            registrationEndDate: new Date('2026-01-10T18:00:00'),
                            location: '서초구육아종합지원센터',
                            address: '서울시 서초구 효령로 283',
                            districtId: seocho.id,
                            targetAgeMin: 3,
                            targetAgeMax: 5,
                            targetGroup: JSON.stringify(['유아']),
                            capacity: 20,
                            isFree: true,
                            originalUrl: 'https://women.seocho.go.kr/child/play123',
                            registrationUrl: 'https://women.seocho.go.kr/apply/play123',
                            category: '교육',
                            organizer: '서초구육아종합지원센터',
                            contact: '02-3477-1399',
                        },
                        {
                            title: '서초 미술관 전시회',
                            description: '지역 작가들의 현대미술 작품을 전시합니다.',
                            startDate: new Date('2026-01-05T10:00:00'),
                            endDate: new Date('2026-02-28T18:00:00'),
                            location: '서초미술관',
                            address: '서울시 서초구 반포대로 11길 20',
                            districtId: seocho.id,
                            targetAgeMin: 0,
                            targetAgeMax: 999,
                            targetGroup: JSON.stringify(['성인', '가족']),
                            isFree: false,
                            fee: '성인 5,000원, 학생 3,000원',
                            originalUrl: 'https://www.seochoart.or.kr/exhibit/2026-01',
                            category: '문화',
                            organizer: '서초미술관',
                            contact: '02-2155-8888',
                        },
                        {
                            title: '시니어 건강체조교실',
                            description: '65세 이상 어르신을 위한 건강체조 프로그램입니다.',
                            startDate: new Date('2026-01-06T10:00:00'),
                            endDate: new Date('2026-03-31T11:00:00'),
                            registrationStartDate: new Date('2025-12-20T00:00:00'),
                            registrationEndDate: new Date('2026-01-03T23:59:00'),
                            location: '서초노인종합복지관',
                            address: '서울시 서초구 서초중앙로 51',
                            districtId: seocho.id,
                            targetAgeMin: 65,
                            targetAgeMax: 999,
                            targetGroup: JSON.stringify(['시니어']),
                            capacity: 30,
                            isFree: true,
                            originalUrl: 'https://www.seocho.go.kr/welfare/senior123',
                            registrationUrl: 'https://www.seocho.go.kr/apply/senior123',
                            category: '복지',
                            organizer: '서초노인종합복지관',
                            contact: '02-3486-5600',
                        },
                        {
                            title: '청소년 진로 멘토링',
                            description: '중·고등학생을 위한 직업별 멘토와의 만남 프로그램입니다.',
                            startDate: new Date('2026-01-18T14:00:00'),
                            endDate: new Date('2026-01-18T17:00:00'),
                            registrationStartDate: new Date('2025-12-25T00:00:00'),
                            registrationEndDate: new Date('2026-01-15T23:59:00'),
                            location: '서초청소년센터',
                            address: '서울시 서초구 남부순환로 347길 46',
                            districtId: seocho.id,
                            targetAgeMin: 13,
                            targetAgeMax: 18,
                            targetGroup: JSON.stringify(['청소년']),
                            capacity: 40,
                            isFree: true,
                            originalUrl: 'https://www.seochoyouth.or.kr/program/career2026',
                            registrationUrl: 'https://www.seochoyouth.or.kr/apply/career2026',
                            category: '교육',
                            organizer: '서초청소년센터',
                            contact: '02-2155-9942',
                        },
                    ];
                    _b = 0, sampleEvents_1 = sampleEvents;
                    _c.label = 12;
                case 12:
                    if (!(_b < sampleEvents_1.length)) return [3 /*break*/, 15];
                    event_1 = sampleEvents_1[_b];
                    return [4 /*yield*/, prisma.event.create({ data: event_1 })];
                case 13:
                    _c.sent();
                    _c.label = 14;
                case 14:
                    _b++;
                    return [3 /*break*/, 12];
                case 15:
                    console.log('✅ Sample events created (10 events)');
                    console.log('🌱 Seeding completed!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
