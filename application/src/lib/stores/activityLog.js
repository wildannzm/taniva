// src/lib/stores/activityLog.js
import { writable, get } from 'svelte/store';

/**
 * @typedef {Object} ActivityEntry
 * @property {string} id
 * @property {string} role - 'petani' | 'umkm' | 'admin'
 * @property {string} username
 * @property {string} action
 * @property {string} detail
 * @property {string} timestamp
 */

const STORAGE_KEY = 'taniva_activity_log';

/** @returns {ActivityEntry[]} */
function loadFromStorage() {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
	} catch {
		return [];
	}
}

/** @type {import('svelte/store').Writable<ActivityEntry[]>} */
export const activityLog = writable(loadFromStorage());

// Persist changes to localStorage
activityLog.subscribe((entries) => {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
	}
});

/**
 * Log a new activity
 * @param {Object} params
 * @param {string} params.role
 * @param {string} params.username
 * @param {string} params.action
 * @param {string} params.detail
 */
export function logActivity({ role, username, action, detail }) {
	const entry = {
		id: crypto.randomUUID(),
		role,
		username,
		action,
		detail,
		timestamp: new Date().toISOString()
	};
	activityLog.update((entries) => [entry, ...entries]);
}

/**
 * Get summary stats for admin dashboard
 * @returns {{ totalUsers: number, todayActivities: number, roleDist: Record<string, number>, recentActivities: ActivityEntry[] }}
 */
export function getActivitySummary() {
	const entries = get(activityLog);
	const today = new Date().toISOString().slice(0, 10);
	
	const todayActivities = entries.filter(e => e.timestamp.slice(0, 10) === today).length;
	
	/** @type {Record<string, number>} */
	const roleDist = {};
	const uniqueUsers = new Set();
	
	for (const e of entries) {
		roleDist[e.role] = (roleDist[e.role] || 0) + 1;
		uniqueUsers.add(e.username);
	}
	
	return {
		totalUsers: uniqueUsers.size,
		todayActivities,
		roleDist,
		recentActivities: entries.slice(0, 15)
	};
}
