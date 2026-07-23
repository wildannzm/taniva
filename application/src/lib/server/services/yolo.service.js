import { getConfig } from '../config.js';

/**
 * Service to interact with the FastAPI YOLOv8 service for tomato grading.
 */
export class YoloService {
	/**
	 * Analyzes a harvest batch image.
	 * @param {File} imageFile - The uploaded image file.
	 * @returns {Promise<{
	 *   qualityScore: number,
	 *   qualityLabel: 'fresh' | 'mixed' | 'rotten',
	 *   freshCount: number,
	 *   rottenCount: number,
	 *   totalDetected: number,
	 *   annotatedImageUrl: string | null,
	 *   inferenceTimeMs: number,
	 *   source: string,
	 *   fallbackUsed: boolean
	 * }>}
	 */
	static async analyzeImage(imageFile) {
		const config = getConfig();

		if (config.DEMO_MODE) {
			// Demo mode returns a mock response without hitting the external service
			return this._getFallbackResponse();
		}

		const formData = new FormData();
		formData.append('image', imageFile);

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), config.YOLO_TIMEOUT_MS);

		let response;
		const startTime = Date.now();
		try {
			response = await fetch(config.YOLO_SERVICE_URL, {
				method: 'POST',
				body: formData,
				signal: controller.signal
			});
		} catch (error) {
			clearTimeout(timeoutId);
			/** @type {any} */
			const err = error;
			if (err.name === 'AbortError') {
				/** @type {any} */
				const timeoutErr = new Error('EXTERNAL_TIMEOUT');
				timeoutErr.code = 'EXTERNAL_TIMEOUT';
				throw timeoutErr;
			}
			/** @type {any} */
			const fetchErr = new Error('AI_SERVICE_ERROR');
			fetchErr.code = 'AI_SERVICE_ERROR';
			throw fetchErr;
		} finally {
			clearTimeout(timeoutId);
		}

		if (!response.ok) {
			/** @type {any} */
			const err = new Error('AI_SERVICE_ERROR');
			err.code = 'AI_SERVICE_ERROR';
			throw err;
		}

		let data;
		try {
			data = await response.json();
		} catch (error) {
			/** @type {any} */
			const err = new Error('AI_SERVICE_ERROR');
			err.code = 'AI_SERVICE_ERROR';
			throw err;
		}

		const inferenceTimeMs = Date.now() - startTime;

		// Validate structure safely (Mendukung class berbahasa indonesia dari model YOLO)
		const freshCount = Number(data?.segarCount ?? data?.segar ?? data?.freshCount ?? 0);
		const rottenCount = Number(data?.busukCount ?? data?.busuk ?? data?.rottenCount ?? 0);
		const totalDetected = freshCount + rottenCount;

		if (totalDetected === 0) {
			/** @type {any} */
			const err = new Error('NO_TOMATO_DETECTED');
			err.code = 'NO_TOMATO_DETECTED';
			throw err;
		}

		// Calculate quality score based on ratio of fresh to total (example standard)
		// Or if FastAPI returns a score, use that. Contract says backend labels:
		// 80–100 = fresh, 50–79 = mixed, 0–49 = rotten
		let qualityScore = data?.qualityScore;
		if (qualityScore === undefined || qualityScore === null) {
			qualityScore = Math.round((freshCount / totalDetected) * 100);
		}

		qualityScore = Math.max(0, Math.min(100, Number(qualityScore)));

		/** @type {'fresh' | 'mixed' | 'rotten'} */
		let qualityLabel;
		if (qualityScore >= 80) qualityLabel = 'fresh';
		else if (qualityScore >= 50) qualityLabel = 'mixed';
		else qualityLabel = 'rotten';

		// FastAPI returns a relative path like `/results/result-...jpg`.
		// We prepend the AI_SERVICE_URL so the frontend can display it directly via the img tag.
		let finalImageUrl = data.annotatedImageUrl || '';
		if (finalImageUrl.startsWith('/results')) {
			try {
				const origin = new URL(config.YOLO_SERVICE_URL).origin;
				finalImageUrl = `${origin}${finalImageUrl}`;
			} catch (e) {
				// Fallback if URL is malformed
				finalImageUrl = `http://localhost:8000${finalImageUrl}`;
			}
		}

		return {
			qualityScore,
			qualityLabel,
			freshCount,
			rottenCount,
			totalDetected,
			annotatedImageUrl: finalImageUrl || null,
			inferenceTimeMs,
			source: 'yolov8-fastapi',
			fallbackUsed: false
		};
	}

	static _getFallbackResponse() {
		const freshCount = 18;
		const rottenCount = 2;
		const totalDetected = freshCount + rottenCount;
		const qualityScore = Math.round((freshCount / totalDetected) * 100);

		/** @type {'fresh' | 'mixed' | 'rotten'} */
		let qualityLabel;
		if (qualityScore >= 80) qualityLabel = 'fresh';
		else if (qualityScore >= 50) qualityLabel = 'mixed';
		else qualityLabel = 'rotten';

		return {
			qualityScore,
			qualityLabel,
			freshCount,
			rottenCount,
			totalDetected,
			annotatedImageUrl: '/results/demo-annotated.jpg',
			inferenceTimeMs: 450,
			source: 'demo-fallback',
			fallbackUsed: true
		};
	}
}
