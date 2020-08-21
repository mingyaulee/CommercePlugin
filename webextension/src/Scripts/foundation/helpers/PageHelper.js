import QueryElement from "../modules/QueryElement.js";

export default class PageHelper {
	/**
	 * Gets element in document
	 * @param {String} query the query selector
	 * @returns {QueryElement} the page element matching the selector
	 */
	static getElement(query) { return new QueryElement(globalThis.document.querySelectorAll(query)); }
}

