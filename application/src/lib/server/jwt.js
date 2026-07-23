import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';

const SECRET = env.SESSION_SECRET || 'fallback-secret-for-development-only-please-change';

export function signToken(payload) {
	return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
	try {
		return jwt.verify(token, SECRET);
	} catch (error) {
		return null;
	}
}
