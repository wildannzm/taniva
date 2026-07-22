import { json } from '@sveltejs/kit';
import { getConfig } from '$lib/server/config.js';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	let nlpConfigured = false;
	let nlpModel = '';

	try {
		const config = getConfig();
		nlpConfigured = true;
		nlpModel = config.OPENROUTER_MODEL;
	} catch {
		// Config validation failed — NLP not properly configured
	}

	return json({
		success: true,
		data: {
			status: 'ok',
			nlpProvider: 'openrouter',
			nlpModel,
			nlpConfigured,
			timestamp: new Date().toISOString()
		}
	});
}
