export default class CommonHelper {
	/**
	 * Wait for a period of time
	 * @param {Number} timeMs wait time
	 * @returns {Promise<Object>}
	 */
	static waitFor(timeMs) {
		return new Promise(resolve => {
			setTimeout(resolve, timeMs);
		});
	}

	/**
	 * Generates a new guid
	 * @returns {String}
	 */
	static guid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
			const r = globalThis.Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
    }
}