import ExtensionHelper from "./ExtensionHelper.js";

export default class LogHelper {
	/**
	 * Creates a new log group
	 * @param {String} name log group name
	 */
	static logGroupStart(name) {
		globalThis.console.groupCollapsed(`${ExtensionHelper.getExtensionName()} ${name}`);
	}

	/**
	 * Ends the current log group
	 */
	static logGroupEnd() {
		globalThis.console.groupEnd();
	}

	/**
	 * Logs a message in the console
	 * @param {String} msg message
	 * @param {...Object} objects objects to log
	 */
	static log(msg, ...objects) {
		if (msg !== null && msg !== undefined && msg.constructor === String) {
			globalThis.console.log("%c" + msg, "color: #2980b9", ...objects);
		} else {
			globalThis.console.log(msg, ...objects);
		}
	}

	/**
	 * Logs an error message in the console
	 * @param {String} msg message
	 * @param {...Object} objects objects to log
	 */
	static error(msg, ...objects) {
		if (msg !== null && msg !== undefined && msg.constructor === String) {
			globalThis.console.log("%c" + msg, "color: #d83939", ...objects);
		} else {
			globalThis.console.error(msg, ...objects);
		}
	}
}