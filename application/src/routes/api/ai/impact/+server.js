import { json } from '@sveltejs/kit';
import { generateImpactRecommendation } from '$lib/server/services/openrouter.service.js';

export async function POST({ request }) {
    try {
        const { metrics, incidents } = await request.json();
        
        if (!metrics || !incidents) {
            return json({ error: 'Missing metrics or incidents data' }, { status: 400 });
        }

        const recommendation = await generateImpactRecommendation(metrics, incidents);
        
        return json({ recommendation });
    } catch (error) {
        console.error('Impact AI API Error:', error);
        return json({ error: 'Gagal memuat rekomendasi AI.' }, { status: 500 });
    }
}
