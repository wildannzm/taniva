// src/lib/stores/app.js
import { writable } from 'svelte/store';

// Global state for current user role ('petani' | 'umkm' | null)
// In a real app this would be populated from auth/session
/** @type {import('svelte/store').Writable<'petani' | 'umkm' | null>} */
export const userRole = writable(null);

/**
 * @typedef {Object} TransactionState
 * @property {any} nlpIntent
 * @property {any[]} matchingResults
 * @property {any} selectedFarmer
 * @property {any} routeEstimate
 * @property {any} lastUploadBatchId
 * @property {any} lastUploadResult
 */

// State to hold data between steps in the transaction flow
/** @type {import('svelte/store').Writable<TransactionState>} */
export const transactionState = writable({
	// UMKM matching flow
	nlpIntent: null,
	matchingResults: [],
	selectedFarmer: null,
	routeEstimate: null,
	
	// Petani upload flow
	lastUploadBatchId: null,
	lastUploadResult: null
});
