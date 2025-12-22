import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SiteAnalysis {
    url: string;
    title: string;
    html_length: number;
    suggested_config: {
        list_selector: string;
        title_selector: string;
        date_selector: string;
    };
    sample_data: any[];
}

@Injectable()
export class SiteAnalyzerService {
    private readonly logger = new Logger(SiteAnalyzerService.name);

    async analyzeSite(url: string): Promise<SiteAnalysis> {
        this.logger.log(`Analyzing site: ${url}`);

        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                timeout: 15000,
            });

            const $ = cheerio.load(response.data);
            const title = $('title').text();

            const selectors = ['table tbody tr', '.board-list tr', 'ul.list li', '.event-list .item'];
            let listSelector = 'table tbody tr';
            let maxCount = 0;

            for (const sel of selectors) {
                const count = $(sel).length;
                if (count > maxCount && count >= 3) {
                    maxCount = count;
                    listSelector = sel;
                }
            }

            const samples: any[] = [];
            $(listSelector).each((i, el) => {
                if (i < 5) {
                    samples.push({
                        index: i,
                        text: $(el).text().trim().substring(0, 200),
                    });
                }
            });

            return {
                url,
                title,
                html_length: response.data.length,
                suggested_config: {
                    list_selector: listSelector,
                    title_selector: 'a, .title, td:nth-child(2)',
                    date_selector: '.date, td:nth-child(3)',
                },
                sample_data: samples,
            };
        } catch (error: any) {
            this.logger.error(`Analysis failed: ${error.message}`);
            throw new Error(`Analysis failed: ${error.message}`);
        }
    }
}
