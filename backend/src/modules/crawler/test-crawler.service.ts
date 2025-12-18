import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class TestCrawlerService {
    private readonly logger = new Logger(TestCrawlerService.name);

    // 테스트 1: 서초구청 공지사항 크롤링 (정적 HTML)
    async testSeochoNotice() {
        this.logger.log('🔍 서초구청 공지사항 크롤링 테스트 시작...');

        try {
            const url = 'https://www.seocho.go.kr/site/seocho/07/10701020000002015041501.jsp';
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            const $ = cheerio.load(response.data);
            const results: Array<{ title: string; date: string; source: string }> = [];

            // 공지사항 리스트 파싱 (실제 구조는 웹사이트 확인 후 수정 필요)
            $('.board-list tr, .list-item, .notice-item').each((index, element) => {
                if (index < 5) { // 최대 5개만 테스트
                    const title = $(element).find('.title, .subject, td:nth-child(2)').text().trim();
                    const date = $(element).find('.date, .reg-date, td:nth-child(4)').text().trim();

                    if (title) {
                        results.push({
                            title: title.substring(0, 100), // 처음 100자만
                            date,
                            source: '서초구청 공지사항',
                        });
                    }
                }
            });

            this.logger.log(`✅ ${results.length}개 항목 발견`);
            return results;
        } catch (error) {
            this.logger.error(`❌ 크롤링 실패: ${error.message}`);
            return [];
        }
    }

    // 테스트 2: 간단한 웹페이지 크롤링 (예시)
    async testSimpleCrawl(url: string) {
        this.logger.log(`🔍 크롤링 테스트: ${url}`);

        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                timeout: 10000, // 10초 타임아웃
            });

            const $ = cheerio.load(response.data);

            const result = {
                title: $('title').text(),
                h1: $('h1').first().text(),
                meta_description: $('meta[name="description"]').attr('content'),
                links_count: $('a').length,
                images_count: $('img').length,
            };

            this.logger.log('✅ 크롤링 성공');
            return result;
        } catch (error) {
            this.logger.error(`❌ 크롤링 실패: ${error.message}`);
            throw error;
        }
    }

    // 테스트 3: 서울 열린데이터 API 호출
    async testSeoulOpenDataAPI() {
        this.logger.log('🔍 서울 열린데이터 API 테스트...');

        try {
            // 실제 API Key는 환경변수로 관리해야 함
            const apiKey = process.env.SEOUL_API_KEY || 'sample';
            const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/culturalEventInfo/1/5/서초구`;

            const response = await axios.get(url, { timeout: 10000 });

            if (response.data.culturalEventInfo) {
                const events = response.data.culturalEventInfo.row || [];
                this.logger.log(`✅ ${events.length}개 행사 발견`);
                return events.map((event: any) => ({
                    title: event.TITLE,
                    place: event.PLACE,
                    date: event.DATE,
                    usage_fee: event.USE_FEE,
                    org_link: event.ORG_LINK,
                }));
            } else {
                this.logger.warn('⚠️ API 호출은 성공했지만 데이터 없음 (API KEY 필요)');
                return [];
            }
        } catch (error) {
            this.logger.error(`❌ API 호출 실패: ${error.message}`);
            return [];
        }
    }
}
