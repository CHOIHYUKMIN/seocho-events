// 서초구청 행사안내 페이지 선택자 테스트
const axios = require('axios');
const cheerio = require('cheerio');

async function testSelectors() {
    console.log('🔍 서초구청 행사안내 페이지 분석 중...\n');

    const url = 'https://www.seocho.go.kr/site/seocho/ex/bbs/List.do?cbIdx=59';

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        const $ = cheerio.load(response.data);

        // 다양한 선택자 테스트
        const selectors = [
            '#content tbody tr',
            'table tbody tr',
            'table.table_list tbody tr',
            '.tbl tbody tr',
            '.board_list tbody tr',
            '.list_type tbody tr',
            'tbody tr',
            '.bbs_list li',
            'ul.list li',
            'div.list li',
        ];

        console.log('📋 선택자 테스트 결과:\n');

        for (const selector of selectors) {
            const items = $(selector);
            if (items.length > 0) {
                console.log(`✅ "${selector}" → ${items.length}개 항목 발견`);

                // 첫 번째 항목의 구조 출력
                if (items.length > 0) {
                    const first = $(items[0]);
                    console.log(`   첫 번째 항목 HTML:`);
                    console.log(`   ${first.html().substring(0, 200)}...\n`);
                }
            } else {
                console.log(`❌ "${selector}" → 0개`);
            }
        }

        // table 태그 찾기
        console.log('\n🔍 페이지 내 모든 table 태그:\n');
        $('table').each((i, table) => {
            const $table = $(table);
            const classes = $table.attr('class') || '(클래스 없음)';
            const id = $table.attr('id') || '(ID 없음)';
            const rows = $table.find('tbody tr').length;
            console.log(`Table ${i + 1}: class="${classes}", id="${id}", rows=${rows}`);
        });

    } catch (error) {
        console.error('❌ 에러 발생:', error.message);
    }
}

testSelectors();
