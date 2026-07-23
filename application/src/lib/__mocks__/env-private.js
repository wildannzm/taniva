/**
 * Mock for $env/dynamic/private used in tests.
 * Provides default test values — override in specific tests via vi.mock().
 */
export const env = {
	OPENROUTER_API_KEY: 'test-api-key-not-real',
	OPENROUTER_MODEL: 'google/gemma-4-31b-it',
	OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
	NLP_TIMEOUT_MS: '15000',
	OPENROUTER_APP_NAME: 'Taniva',
	PUBLIC_APP_URL: 'http://localhost:5173'
};
