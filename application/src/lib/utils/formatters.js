/** @param {number|string} value */
export function formatRupiah(value) {
	if (!value && value !== 0) return '-';
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0
	}).format(Number(value));
}

/** @param {number|string} value */
export function formatKg(value) {
	if (!value && value !== 0) return '-';
	return `${Number(value).toLocaleString('id-ID')} Kg`;
}

/** @param {string|Date} dateString */
export function formatTanggal(dateString) {
	if (!dateString) return '-';
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);
}

/** @param {number|string} score */
export function formatScore(score) {
	if (!score && score !== 0) return '-';
	return `${score}/100`;
}

export const errorMessageMapping = {
	'FILE_TOO_LARGE': 'Ukuran file terlalu besar',
	'UNSUPPORTED_FILE_TYPE': 'Tipe file tidak didukung',
	'EXTERNAL_TIMEOUT': 'Waktu habis saat menghubungi server eksternal',
	'NO_TOMATO_DETECTED': 'Tomat tidak terdeteksi'
};
