import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DataSource } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export interface CollectionResult {
    collected: number;
    added: number;
    updated: number;
    errors: string[];
}

interface RawEvent {
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
    location?: string;
    address?: string;
    targetAgeMin?: number;
    targetAgeMax?: number;
    targetGroup?: string[];
    isFree?: boolean;
    fee?: string;
    originalUrl: string;
    registrationUrl?: string;
    imageUrl?: string;
    category: string;
    organizer?: string;
    contact?: string;
    districtId: number;
}

interface CrawlerConfig {
    method?: 'static' | 'dynamic'; // 정적(cheerio) vs 동적(puppeteer)
    selector?: string;
    listSelector?: string;
    titleSelector?: string;
    dateSelector?: string;
    descriptionSelector?: string;
    linkSelector?: string;
    waitForSelector?: string;
    apiKey?: string;
    endpoint?: string;
    districtFilter?: string;
    maxRetries?: number;
    timeout?: number;

    // 상세 페이지 크롤링
    crawlDetailPage?: boolean;
    detailSelectors?: {
        title?: string;
        content?: string;
        department?: string;
        contact?: string;
        date?: string;
        images?: string;
    };

    // 페이지네이션
    paginationEnabled?: boolean;
    paginationUrlPattern?: string;  // 예: '&pageIndex={page}'
    paginationMaxPages?: number;

    // 달력 모드 (육아종합지원센터 등)
    calendarMode?: boolean;
    calendarMonths?: number;  // 크롤링할 개월 수 (기본: 2개월)
}

@Injectable()
export class CrawlerService {
    private readonly logger = new Logger(CrawlerService.name);
    private readonly DEFAULT_TIMEOUT = 15000;
    private readonly MAX_RETRIES = 3;

    constructor(private prisma: PrismaService) { }

    /**
     * 데이터 소스로부터 행사 정보 수집
     */
    async collectFromSource(source: DataSource & { district: any }): Promise<CollectionResult> {
        this.logger.log(`수집 시작: ${source.name} (${source.sourceType})`);

        const errors: string[] = [];
        let rawEvents: RawEvent[] = [];

        try {
            if (source.sourceType === 'API') {
                rawEvents = await this.collectFromApi(source);
            } else if (source.sourceType === 'WEB_SCRAPING') {
                rawEvents = await this.collectFromWeb(source);
            } else {
                throw new Error(`지원하지 않는 소스 타입: ${source.sourceType}`);
            }
        } catch (error: any) {
            this.logger.error(`수집 실패: ${source.name}`, error.stack);
            errors.push(error.message);
        }

        // 중복 제거 및 저장
        const result = await this.saveEvents(rawEvents, source.id);

        // 마지막 수집 시간 업데이트
        await this.prisma.dataSource.update({
            where: { id: source.id },
            data: { lastCollectedAt: new Date() },
        });

        return { ...result, errors };
    }

    /**
     * API를 통한 데이터 수집
     */
    private async collectFromApi(source: DataSource & { district: any }): Promise<RawEvent[]> {
        this.logger.log(`API 수집: ${source.url}`);

        const config: CrawlerConfig = source.config ? JSON.parse(source.config) : {};
        const events: RawEvent[] = [];

        try {
            // URL에 이미 API 키가 포함되어 있는지 확인
            const isUrlComplete = source.url.includes('/json/') || source.url.includes('/xml/');

            let response;
            if (isUrlComplete) {
                // URL이 완전한 경우 (서울 열린데이터)
                this.logger.log('완전한 API URL 사용');
                response = await axios.get(source.url, {
                    timeout: config.timeout || this.DEFAULT_TIMEOUT,
                });
            } else {
                // 파라미터 방식
                response = await axios.get(source.url, {
                    params: {
                        KEY: config.apiKey || '',
                        TYPE: 'json',
                        SERVICE: 'culturalEventInfo',
                        START_INDEX: 1,
                        END_INDEX: 100,
                    },
                    timeout: config.timeout || this.DEFAULT_TIMEOUT,
                });
            }

            const data = response.data;
            this.logger.log(`API 응답 수신: ${JSON.stringify(Object.keys(data))}`);

            // 서울 열린데이터 API 형식
            if (data.culturalEventInfo) {
                const result = data.culturalEventInfo;

                // 에러 체크
                if (result.RESULT) {
                    const resultCode = result.RESULT.CODE;
                    if (resultCode !== 'INFO-000') {
                        throw new Error(`API Error: ${result.RESULT.MESSAGE}`);
                    }
                }

                // 데이터 파싱
                if (result.row && Array.isArray(result.row)) {
                    const rows = result.row;
                    this.logger.log(`${rows.length}개 행사 발견`);

                    for (const row of rows) {
                        // 지역 필터링
                        if (config.districtFilter) {
                            const guname = row.GUNAME || row.CODENAME || '';
                            if (!guname.includes(config.districtFilter)) {
                                continue;
                            }
                        }

                        // 날짜 파싱
                        const startDate = this.parseDate(row.STRTDATE || row.DATE);
                        if (!startDate) {
                            this.logger.warn(`날짜 파싱 실패: ${row.TITLE}`);
                            continue;
                        }

                        events.push({
                            title: row.TITLE || row.CODENAME || '제목 없음',
                            description: row.PROGRAM || row.ORG_LINK || '',
                            startDate,
                            endDate: this.parseDate(row.END_DATE) || undefined,
                            location: row.PLACE || row.GUNAME || '',
                            address: row.ADDR || row.PLACE || '',
                            targetAgeMin: this.parseAge(row.USE_TRGT)?.min || 0,
                            targetAgeMax: this.parseAge(row.USE_TRGT)?.max || 999,
                            targetGroup: row.USE_TRGT ? [row.USE_TRGT] : undefined,
                            isFree: row.USE_FEE === '무료' || row.IS_FREE === 'Y' || row.USE_FEE === '0',
                            fee: row.USE_FEE !== '무료' && row.USE_FEE !== '0' ? row.USE_FEE : undefined,
                            originalUrl: row.ORG_LINK || row.HMPG_ADDR || source.url,
                            registrationUrl: row.RGSTDATE ? (row.ORG_LINK || row.HMPG_ADDR) : undefined,
                            imageUrl: row.MAIN_IMG || row.IMGURL,
                            category: this.mapCategory(row.CODENAME || row.TITLE),
                            organizer: row.ORG_NAME || source.name,
                            contact: row.ORG_PHONE || row.PHONE || row.TELNO,
                            districtId: source.districtId,
                        });
                    }
                }
            }

            this.logger.log(`API 수집 완료: ${events.length}개 행사`);
        } catch (error: any) {
            this.logger.error(`API 수집 실패: ${error.message}`);
            if (error.response) {
                this.logger.error(`응답 상태: ${error.response.status}`);
                this.logger.error(`응답 데이터: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }

        return events;
    }

    /**
     * 웹 스크래핑을 통한 데이터 수집
     */
    private async collectFromWeb(source: DataSource & { district: any }): Promise<RawEvent[]> {
        const config: CrawlerConfig = source.config ? JSON.parse(source.config) : {};
        const method = config.method || 'static';

        this.logger.log(`웹 스크래핑 (${method}): ${source.url}`);

        if (method === 'dynamic') {
            return await this.collectWithPuppeteer(source, config);
        } else {
            return await this.collectWithCheerio(source, config);
        }
    }

    /**
     * Cheerio를 사용한 정적 웹 스크래핑
     */
    private async collectWithCheerio(
        source: DataSource & { district: any },
        config: CrawlerConfig,
    ): Promise<RawEvent[]> {
        const events: RawEvent[] = [];

        try {
            let urls: string[] = [];

            // 달력 모드: 당월 + 다음달 URL 생성
            if (config.calendarMode) {
                const months = config.calendarMonths || 2;
                const today = new Date();

                for (let i = 0; i < months; i++) {
                    const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
                    const year = targetDate.getFullYear();
                    const month = targetDate.getMonth() + 1;

                    // 육아종합지원센터는 datToday=YYYYMM 형식 사용
                    const datToday = `${year}${month.toString().padStart(2, '0')}`;
                    const calendarUrl = `${source.url}${source.url.includes('?') ? '&' : '?'}datToday=${datToday}`;
                    urls.push(calendarUrl);
                }
                this.logger.log(`달력 모드: ${months}개월 크롤링 (${urls.length}개 URL)`);
            } else {
                // 일반 페이지네이션 지원
                urls = this.generatePaginationUrls(source.url, config);
            }

            this.logger.log(`크롤링 대상 URL 개수: ${urls.length}`);

            for (const url of urls) {
                this.logger.log(`페이지 크롤링: ${url}`);
                const pageEvents = await this.crawlSinglePage(url, source, config);
                events.push(...pageEvents);

                // Rate limiting
                if (urls.length > 1) {
                    await this.delay(1000); // 1초 대기
                }
            }

            this.logger.log(`정적 스크래핑 완료: ${events.length}개 행사`);
        } catch (error: any) {
            this.logger.error(`정적 스크래핑 실패: ${error.message}`);
            throw error;
        }

        return events;
    }

    /**
     * 단일 페이지 크롤링
     */
    private async crawlSinglePage(
        url: string,
        source: DataSource & { district: any },
        config: CrawlerConfig,
    ): Promise<RawEvent[]> {
        const events: RawEvent[] = [];

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: config.timeout || this.DEFAULT_TIMEOUT,
        });

        const $ = cheerio.load(response.data);
        const listSelector = config.listSelector || config.selector || 'table tbody tr';

        const items = $(listSelector);
        this.logger.log(`${items.length}개 항목 발견`);

        // 디버깅: 0개면 다른 선택자들도 시도해보기
        if (items.length === 0) {
            this.logger.warn(`선택자 '${listSelector}'로 항목을 찾을 수 없습니다. 다른 선택자 시도 중...`);

            const alternatives = [
                'table.table_list tbody tr',
                '.tbl tbody tr',
                '.board_list tbody tr',
                '.list tbody tr',
                'table tbody tr',
                '.bbs_list li',
                'ul.list li',
            ];

            for (const alt of alternatives) {
                const altItems = $(alt);
                if (altItems.length > 0) {
                    this.logger.log(`대안 선택자 '${alt}'로 ${altItems.length}개 항목 발견!`);
                }
            }
        }

        for (let index = 0; index < items.length; index++) {
            try {
                const $el = $(items[index]);

                // 제목 추출
                const titleSelector = config.titleSelector || 'a, .title, td:nth-child(2)';
                let title = $el.find(titleSelector).first().text().trim();

                if (!title || title.length < 2) continue;

                // 날짜 추출
                const dateSelector = config.dateSelector || '.date, td:nth-child(4), .period';
                const dateText = $el.find(dateSelector).first().text().trim();
                let startDate = this.parseDate(dateText);

                // 육아종합지원센터: href에서 the_day 파라미터 추출
                if (!startDate && config.listSelector === 'a.schedule') {
                    const href = $el.attr('href') || '';
                    const theDayMatch = href.match(/the_day=(\d{4}-\d{2}-\d{2})/);
                    if (theDayMatch) {
                        startDate = this.parseDate(theDayMatch[1]);
                        this.logger.log(`href에서 날짜 추출: ${theDayMatch[1]}`);
                    }
                }

                // 링크 추출
                const linkSelector = config.linkSelector || 'a';
                let link = '';

                // listSelector와 linkSelector가 같으면 $el 자체가 링크
                if (linkSelector === config.listSelector) {
                    link = $el.attr('href') || '';
                } else {
                    link = $el.find(linkSelector).first().attr('href') || '';
                }

                // 상대 경로를 절대 경로로 변환
                if (link && !link.startsWith('http')) {
                    const baseUrl = new URL(url);

                    // 육아종합지원센터: appFamily_view.asp 링크 처리
                    if (link.includes('appFamily_view.asp')) {
                        // 현재 URL의 디렉토리 경로 사용
                        const basePath = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1);
                        link = `${baseUrl.origin}${basePath}${link}`;
                        this.logger.log(`육아센터 링크 변환: ${link}`);
                    } else {
                        link = new URL(link, baseUrl.origin).toString();
                    }
                }

                // 설명 추출
                const descriptionSelector = config.descriptionSelector || '.description';
                let description = $el.find(descriptionSelector).first().text().trim();

                // location 기본값
                let location = source.district.name;

                // 시간 정보 변수
                let startTime: string | undefined;
                let endTime: string | undefined;

                // 상세 페이지 크롤링
                if (config.crawlDetailPage && link) {
                    try {
                        const details = await this.crawlDetailPage(link, config);

                        // 상세 페이지 정보로 업데이트
                        if (details.title) title = details.title;
                        if (details.description) description = details.description;
                        if (details.startDate) startDate = details.startDate;
                        if (details.location) location = details.location;
                        if (details.startTime) startTime = details.startTime;
                        if (details.endTime) endTime = details.endTime;

                        this.logger.log(`상세 페이지 크롤링 완료: ${title}${details.startDate ? ` (${details.startDate.toLocaleDateString()})` : ''}${startTime ? ` ${startTime}` : ''}`);

                        // Rate limiting
                        await this.delay(500);
                    } catch (error: any) {
                        this.logger.warn(`상세 페이지 크롤링 실패 (${title}): ${error.message}`);
                    }
                }

                if (!startDate) {
                    // 날짜가 없으면 현재 날짜 사용
                    startDate = new Date();
                }

                events.push({
                    title,
                    description: description || undefined,
                    startDate,
                    startTime,
                    endTime,
                    location,
                    targetAgeMin: 0,
                    targetAgeMax: 999,
                    isFree: true,
                    originalUrl: link || url,
                    category: this.mapCategory(title),
                    organizer: source.name,
                    districtId: source.districtId,
                });
            } catch (error: any) {
                this.logger.warn(`항목 파싱 실패 (index ${index}): ${error.message}`);
            }
        }

        return events;
    }

    /**
     * 상세 페이지 크롤링
     */
    private async crawlDetailPage(url: string, config: CrawlerConfig): Promise<any> {
        const details: any = {};

        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                timeout: config.timeout || this.DEFAULT_TIMEOUT,
            });

            const $ = cheerio.load(response.data);

            // 상세 페이지에서 정보 추출
            if (config.detailSelectors) {
                if (config.detailSelectors.title) {
                    details.title = $(config.detailSelectors.title).first().text().trim();
                }
                if (config.detailSelectors.content) {
                    const contentText = $(config.detailSelectors.content).first().text().trim();
                    details.description = contentText;

                    // 본문에서 실제 행사 일시 추출 (서초구청 형식)
                    // 예: "❍ 일    시 : 2025. 11. 2.(일) 13:00~21:00"
                    const eventDateMatch = contentText.match(/(?:일\s*시|일시)\s*:\s*([^\n❍*]+)/);
                    if (eventDateMatch) {
                        const eventDateStr = eventDateMatch[1].trim();
                        this.logger.log(`본문에서 행사 일시 추출: ${eventDateStr}`);

                        // 날짜 파싱 시도
                        const parsedDate = this.parseDate(eventDateStr);
                        if (parsedDate) {
                            details.startDate = parsedDate;
                            this.logger.log(`파싱된 행사 일시: ${parsedDate.toISOString()}`);
                        }

                        // 시간 정보 추출 (예: "13:00~21:00", "14:00", "오후 2시~5시")
                        const timeMatch = eventDateStr.match(/(\d{1,2}):(\d{2})\s*[~-]\s*(\d{1,2}):(\d{2})/);
                        if (timeMatch) {
                            details.startTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
                            details.endTime = `${timeMatch[3].padStart(2, '0')}:${timeMatch[4]}`;
                            this.logger.log(`시간 추출: ${details.startTime} ~ ${details.endTime}`);
                        } else {
                            // 단일 시간만 있는 경우 (예: "14:00")
                            const singleTimeMatch = eventDateStr.match(/(\d{1,2}):(\d{2})/);
                            if (singleTimeMatch) {
                                details.startTime = `${singleTimeMatch[1].padStart(2, '0')}:${singleTimeMatch[2]}`;
                                this.logger.log(`시작 시간 추출: ${details.startTime}`);
                            }
                        }
                    }

                    // 본문에서 장소 정보 추출
                    // 예: "❍ 장    소 : 강남역 일대"
                    const locationMatch = contentText.match(/(?:장\s*소)\s*:\s*([^\n❍*]+)/);
                    if (locationMatch) {
                        details.location = locationMatch[1].trim();
                        this.logger.log(`본문에서 장소 추출: ${details.location}`);
                    }
                }
                if (config.detailSelectors.department) {
                    details.department = $(config.detailSelectors.department).first().text().trim();
                }
                if (config.detailSelectors.contact) {
                    details.contact = $(config.detailSelectors.contact).first().text().trim();
                }
                // detailSelectors.date는 이제 본문 파싱으로 대체됨
            }
        } catch (error: any) {
            this.logger.warn(`상세 페이지 크롤링 실패: ${error.message}`);
        }

        return details;
    }

    /**
     * 페이지네이션 URL 생성
     */
    private generatePaginationUrls(baseUrl: string, config: CrawlerConfig): string[] {
        const urls: string[] = [baseUrl];

        if (!config.paginationEnabled) {
            return urls;
        }

        if (config.paginationUrlPattern && config.paginationMaxPages) {
            const maxPages = Math.min(config.paginationMaxPages, 50); // 최대 50페이지

            for (let page = 2; page <= maxPages; page++) {
                let url = baseUrl;
                if (baseUrl.includes('?')) {
                    url += config.paginationUrlPattern.replace('{page}', page.toString());
                } else {
                    url += '?' + config.paginationUrlPattern.replace('{page}', page.toString()).substring(1);
                }
                urls.push(url);
            }
        }

        return urls;
    }

    /**
     * 딜레이 헬퍼 함수
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    /**
     * Puppeteer를 사용한 동적 웹 스크래핑
     */
    private async collectWithPuppeteer(
        source: DataSource & { district: any },
        config: CrawlerConfig,
    ): Promise<RawEvent[]> {
        const events: RawEvent[] = [];
        let browser;

        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            // 페이지 로드
            await page.goto(source.url, {
                waitUntil: 'networkidle2',
                timeout: config.timeout || this.DEFAULT_TIMEOUT,
            });

            // 동적 컨텐츠 대기
            if (config.waitForSelector) {
                await page.waitForSelector(config.waitForSelector, { timeout: 10000 });
            }

            // 페이지 내용 추출
            const listSelector = config.listSelector || config.selector || '.event-list .item';
            const items = await page.$$(listSelector);

            this.logger.log(`${items.length}개 항목 발견`);

            for (const item of items) {
                try {
                    const titleSelector = config.titleSelector || '.title, h3, a';
                    const dateSelector = config.dateSelector || '.date, .period';
                    const descriptionSelector = config.descriptionSelector || '.description, .content';
                    const linkSelector = config.linkSelector || 'a';

                    const title = await item.$eval(titleSelector, el => el.textContent?.trim() || '').catch(() => '');
                    const dateText = await item.$eval(dateSelector, el => el.textContent?.trim() || '').catch(() => '');
                    const description = await item.$eval(descriptionSelector, el => el.textContent?.trim() || '').catch(() => '');
                    let link = await item.$eval(linkSelector, el => el.getAttribute('href') || '').catch(() => '');

                    if (!title || title.length < 2) continue;

                    const startDate = this.parseDate(dateText);
                    if (!startDate) continue;

                    // 상대 경로를 절대 경로로 변환
                    if (link && !link.startsWith('http')) {
                        const baseUrl = new URL(source.url);
                        link = new URL(link, baseUrl.origin).toString();
                    }

                    events.push({
                        title,
                        description: description || undefined,
                        startDate,
                        location: source.district.name,
                        targetAgeMin: 0,
                        targetAgeMax: 999,
                        isFree: true,
                        originalUrl: link || source.url,
                        category: this.mapCategory(title),
                        organizer: source.name,
                        districtId: source.districtId,
                    });
                } catch (error: any) {
                    this.logger.warn(`항목 파싱 실패: ${error.message}`);
                }
            }

            this.logger.log(`동적 스크래핑 완료: ${events.length}개 행사`);
        } catch (error: any) {
            this.logger.error(`동적 스크래핑 실패: ${error.message}`);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }

        return events;
    }

    /**
     * 수집된 행사 저장 (중복 제거)
     */
    private async saveEvents(rawEvents: RawEvent[], dataSourceId: number): Promise<CollectionResult> {
        let added = 0;
        let updated = 0;

        for (const rawEvent of rawEvents) {
            try {
                // 중복 체크: 같은 제목 + 같은 시작일
                const existing = await this.prisma.event.findFirst({
                    where: {
                        title: rawEvent.title,
                        startDate: rawEvent.startDate,
                    },
                });

                if (existing) {
                    // 기존 행사 업데이트
                    await this.prisma.event.update({
                        where: { id: existing.id },
                        data: {
                            description: rawEvent.description || existing.description,
                            originalUrl: rawEvent.originalUrl,
                            lastSyncedAt: new Date(),
                        },
                    });
                    updated++;
                } else {
                    // 신규 행사 추가
                    await this.prisma.event.create({
                        data: {
                            ...rawEvent,
                            targetGroup: rawEvent.targetGroup ? JSON.stringify(rawEvent.targetGroup) : null,
                            dataSourceId,
                        },
                    });
                    added++;
                }
            } catch (error: any) {
                this.logger.error(`행사 저장 실패: ${rawEvent.title}`, error.message);
            }
        }

        this.logger.log(`저장 완료: ${added}개 추가, ${updated}개 업데이트`);

        return {
            collected: rawEvents.length,
            added,
            updated,
            errors: [],
        };
    }

    /**
     * 날짜 문자열 파싱
     */
    private parseDate(dateStr: string | undefined): Date | null {
        if (!dateStr) return null;

        try {
            // 여러 날짜 형식 지원
            const cleaned = dateStr.replace(/[^\d.-]/g, '').trim();

            // YYYY-MM-DD, YYYY.MM.DD, YYYYMMDD
            const dateMatch = cleaned.match(/(\d{4})[-./]?(\d{1,2})[-./]?(\d{1,2})/);
            if (dateMatch) {
                const [, year, month, day] = dateMatch;
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }

            // 다른 형식도 시도
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }
        } catch (error) {
            this.logger.warn(`날짜 파싱 실패: ${dateStr}`);
        }

        return null;
    }

    /**
     * 대상 연령 파싱
     */
    private parseAge(targetStr: string | undefined): { min: number; max: number } | null {
        if (!targetStr) return null;

        if (targetStr.includes('유아')) return { min: 0, max: 7 };
        if (targetStr.includes('어린이')) return { min: 7, max: 13 };
        if (targetStr.includes('청소년')) return { min: 13, max: 19 };
        if (targetStr.includes('청년')) return { min: 19, max: 39 };
        if (targetStr.includes('중장년') || targetStr.includes('성인')) return { min: 40, max: 64 };
        if (targetStr.includes('어르신') || targetStr.includes('시니어')) return { min: 65, max: 999 };

        return null;
    }

    /**
     * 카테고리 매핑
     */
    private mapCategory(title: string): string {
        if (title.includes('축제') || title.includes('페스티벌')) return '축제';
        if (title.includes('공연') || title.includes('콘서트')) return '문화';
        if (title.includes('전시') || title.includes('미술') || title.includes('갤러리')) return '문화';
        if (title.includes('교육') || title.includes('강좌') || title.includes('교실')) return '교육';
        if (title.includes('체육') || title.includes('운동') || title.includes('달리기')) return '체육';
        if (title.includes('복지') || title.includes('건강')) return '복지';
        return '문화';
    }

    /**
     * 중복 체크 헬퍼 함수
     */
    async checkDuplicate(title: string, startDate: Date): Promise<boolean> {
        const existing = await this.prisma.event.findFirst({
            where: { title, startDate },
        });
        return !!existing;
    }
}
