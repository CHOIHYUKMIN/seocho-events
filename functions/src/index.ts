import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Firebase Admin 초기화
admin.initializeApp();

/**
 * 매일 새벽 2시에 실행되는 크롤링 스케줄러
 * 
 * 배포 명령:
 * firebase deploy --only functions:scheduledCrawler
 * 
 * 테스트:
 * gcloud functions call scheduledCrawler --region=asia-northeast3
 */
export const scheduledCrawler = functions
    .region('asia-northeast3')  // 서울 리전
    .runWith({
        timeoutSeconds: 540,  // 9분 (최대 허용 시간)
        memory: '512MB',
    })
    .pubsub.schedule('0 2 * * *')  // 매일 새벽 2시 (Cron 표현식)
    .timeZone('Asia/Seoul')
    .onRun(async (context) => {
        const API_URL = functions.config().api?.url || process.env.API_URL;

        if (!API_URL) {
            console.error('❌ API_URL이 설정되지 않았습니다!');
            console.log('설정 방법: firebase functions:config:set api.url="https://your-api-url"');
            throw new Error('API_URL not configured');
        }

        console.log('🤖 자동 크롤링 시작...', new Date().toISOString());
        console.log('API URL:', API_URL);

        try {
            // 모든 데이터 소스 크롤링
            const response = await axios.post(
                `${API_URL}/data-sources/collect`,
                {},
                {
                    timeout: 480000,  // 8분 타임아웃
                }
            );

            console.log('✅ 크롤링 완료:', response.data);

            // 크롤링 결과 로그 저장 (Firestore에 저장)
            await admin.firestore().collection('crawling_logs').add({
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'success',
                data: response.data,
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error('❌ 크롤링 실패:', error.message);

            // 에러 로그 저장
            await admin.firestore().collection('crawling_logs').add({
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'error',
                error: error.message,
            });

            throw error;
        }
    });

/**
 * 수동으로 크롤링을 트리거할 수 있는 HTTP Function
 * 
 * 사용법:
 * curl https://asia-northeast3-[PROJECT_ID].cloudfunctions.net/manualCrawl \
 *   -H "Authorization: Bearer $(gcloud auth print-identity-token)"
 */
export const manualCrawl = functions
    .region('asia-northeast3')
    .runWith({
        timeoutSeconds: 540,
        memory: '512MB',
    })
    .https.onRequest(async (req, res) => {
        // CORS 설정
        res.set('Access-Control-Allow-Origin', '*');

        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Methods', 'POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            res.status(204).send('');
            return;
        }

        const API_URL = functions.config().api?.url || process.env.API_URL;

        if (!API_URL) {
            res.status(500).json({ error: 'API_URL not configured' });
            return;
        }

        try {
            console.log('🚀 수동 크롤링 시작...');

            const response = await axios.post(
                `${API_URL}/data-sources/collect`,
                {},
                { timeout: 480000 }
            );

            await admin.firestore().collection('crawling_logs').add({
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'success',
                type: 'manual',
                data: response.data,
            });

            res.json({
                success: true,
                message: '크롤링이 완료되었습니다.',
                data: response.data,
            });
        } catch (error: any) {
            console.error('❌ 크롤링 실패:', error.message);

            await admin.firestore().collection('crawling_logs').add({
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: 'error',
                type: 'manual',
                error: error.message,
            });

            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

/**
 * 크롤링 로그 조회 API
 */
export const getCrawlingLogs = functions
    .region('asia-northeast3')
    .https.onRequest(async (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');

        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Methods', 'GET');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            res.status(204).send('');
            return;
        }

        try {
            const limit = parseInt(req.query.limit as string) || 10;

            const logsSnapshot = await admin.firestore()
                .collection('crawling_logs')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            const logs = logsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            res.json({ logs });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });
