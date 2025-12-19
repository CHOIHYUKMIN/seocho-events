import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaService } from '../../common/prisma.service';

interface SiteAnalysis {
    url: string;
    title: string;
    html_length: number;
    detected_patterns: {
        tables: number;
        lists: number;
        articles: number;
        potential_selectors: string[];
    };
    suggested_config: {
        list_selector: string;
        title_selector: string;
        date_selector: string;
        description_selector: string;
    };
    sample_data: any[];
}

@Injectable()
export class SiteAnalyzerService {
    private readonly logger = new Logger(SiteAnalyzerService.name);

    constructor(private prisma: PrismaService) { }

    // 사이트 자동 분석
    async analyzeSite(url: string): Promise<SiteAnalysis> {
        this.logger.log(`🔍 사이트 분석 시작: ${url}`);

        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                timeout: 15000,
            });

            const $ = cheerio.load(response.data);
            const title = $('title').text();

            // 1. 패턴 탐지
            const patterns = this.detectPatterns($);

            // 2. 셀렉터 제안
            const suggested = this.suggestSelectors($);

            // 3. 샘플 데이터 추출
            const samples = this.extractSamples($, suggested.list_selector);

            return {
                url,
                title,
                html_length: response.data.length,
                detected_patterns: patterns,
                suggested_config: suggested,
                sample_data: samples.slice(0, 5), // 최대 5개
            };
        } catch (error: any) {
            this.logger.error(`❌ 분석 실패: ${error.message}`);
            throw new Error(`사이트 분석 실패: ${error.message}`);
        }
    }

    // 패턴 탐지
    private detectPatterns($: cheerio.CheerioAPI) {
        const tables = $('table tbody tr').length;
        const lists = $('ul li, ol li').length;
        const articles = $('article').length;

        // 잠재적 셀렉터 찾기
        const potentialSelectors: string[] = [];

        // 게시판 형태
        if (tables > 5) {
            potentialSelectors.push('table tbody tr');
            potentialSelectors.push('.board-list tr');
        }

        // 리스트 형태
        if (lists > 5) {
            potentialSelectors.push('ul.list li');
            potentialSelectors.push('.event-list .item');
        }

        // 카드 형태
        if (articles > 3) {
            potentialSelectors.push('article');
            potentialSelectors.push('.card');
        }

        // 일반적인 클래스 이름
        ['.list-item', '.item', '.event', '.notice', '.post'].forEach(selector => {
            if ($(selector).length > 3) {
                potentialSelectors.push(selector);
            }
        });

        return {
            tables,
            lists,
            articles,
            potential_selectors: potentialSelectors,
        };
    }

    // 셀렉터 제안
    private suggestSelectors($: cheerio.CheerioAPI) {
        let listSelector = 'table tbody tr'; // 기본값

        // 가장 많은 항목을 가진 셀렉터 찾기
        const candidates = [
            'table tbody tr',
            '.board-list tr',
            'ul.list li',
            '.event-list .item',
            '.list-item',
            'article',
            '.card',
        ];

        let maxCount = 0;
        for (const selector of candidates) {
            const count = $(selector).length;
            if (count > maxCount && count >= 3) {
                maxCount = count;
                listSelector = selector;
            }
        }

        return {
            list_selector: listSelector,
            title_selector: 'a, .title, .subject, td:nth-child(2)',
            date_selector: '.date, .reg-date, td:nth-child(3)',
            description_selector: '.content, .description',
        };
    }

    // 샘플 데이터 추출
    private extractSamples($: cheerio.CheerioAPI, listSelector: string) {
        const samples: any[] = [];

        $(listSelector).each((i, element) => {
            if (i < 10) { // 최대 10개
                const $el = $(element);
                samples.push({
                    index: i,
                    html: $el.html()?.substring(0, 200),
                    text: $el.text().trim().substring(0, 200),
                    links: $el.find('a').length,
                });
            }
        });

        return samples;
    }

    // 크롤링 테스트 (실제 데이터 추출)
    async testCrawling(dataSourceId: number) {
        const dataSource = await this.prisma.dataSource.findUnique({
            where: { id: dataSourceId },
        });

        if (!dataSource || !dataSource.config) {
            throw new Error('DataSource not found or no config');
        }

        const config = JSON.parse(dataSource.config as string);

        try {
            const response = await axios.get(dataSource.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                timeout: 15000,
            });

            const $ = cheerio.load(response.data);
            const results: any[] = [];

            $(config.list_selector).each((i, element) => {
                if (i < 5) {
                    const $el = $(element);
                    results.push({
                        title: $el.find(config.title_selector).first().text().trim(),
                        date: $el.find(config.date_selector).first().text().trim(),
                        link: $el.find('a').first().attr('href'),
                    });
                }
            });

            return {
                success: true,
                count: results.length,
                data: results,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}
