import QueryString, { QueryValueCollection } from "../modules/QueryString.js";

/**
 * Execute option object
 * @typedef {Object} ExecuteOption
 * @property {String} [code] code to execute
 * @property {String} [frameId] "#frameId" or "/frame/url"
 */

/**
 * Wait option object
 * @typedef {Object} WaitOption
 * @property {Number} [pollMs] frequency of polling
 * @property {Number} [timeoutMs] timeout period
 * @property {Number} [delayMs] delay period
 */

/**
 * Base Script Helper
 * @class
 */
export default class BaseScriptHelper {
    /**
     * Executes script
     * @abstract
     * @param {String} code code to execute
     * @param {ExecuteOption} [executeOption] execute option
     * @returns {Promise<Object>}
     */
    async executeScriptAsync(code, executeOption) { throw new Error("Not implemented"); }

    /**
     * Gets the document title
     * @abstract
     * @returns {Promise<String>}
     */
    async getDocumentTitleAsync() { throw new Error("Not implemented"); }

    /**
     * Gets the full url (origin/search#hash)
     * @abstract
     * @returns {Promise<String>}
     */
    async getFullUrlAsync() { throw new Error("Not implemented"); }

    /**
     * Gets the host of the URL (localhost:port)
     * @abstract
     * @returns {Promise<String>}
     */
    async getUrlHostAsync() { throw new Error("Not implemented"); }

    /**
     * Checks if the url contains the input string
     * @abstract
     * @param {String} str input
     * @returns {Promise<Boolean>}
     */
    async urlContainsAsync(str) { throw new Error("Not implemented"); }

    /**
     * Checks if the url query contains the input string
     * @abstract
     * @param {String} str input
     * @returns {Promise<Boolean>}
     */
    async queryContainsAsync(str) { throw new Error("Not implemented"); }

    /**
	 * Gets the key-value dictionary of the URL query, or get the dictionary value when the optional parameter `key` is provided
     * @abstract
	 * @param {String} [key] the key to retrieve from URL query, if provided returns ValueCollection
	 * @returns {Promise<QueryString|QueryValueCollection>} QueryString object or ValueCollection for the key provided
	 */
    async getQueryAsync(key) { throw new Error("Not implemented"); }

    /**
	 * Redirects the current tab to the provided url
     * @abstract
	 * @param {String} url url to redirect to
	 * @returns {Promise<Object>}
	 */
	async redirectToAsync(url) { throw new Error("Not implemented"); }

    /**
     * Checks if frame exists in tab
     * @abstract
     * @param {String} frameId "#frameId" or "/frame/url"
	 * @returns {Promise<Object>}
	 */
	async checkFrameExistAsync(frameId) { throw new Error("Not implemented"); }

    /**
     * Wait for frame to exist
     * @abstract
     * @param {String} frameId "#frameId" or "/frame/url"
	 * @returns {Promise<Object>}
	 */
	async waitForFrameExistAsync(frameId) { throw new Error("Not implemented"); }

    /**
     * Wait for document load to be completed
     * @abstract
	 * @returns {Promise<Object>}
	 */
	async waitForDocumentLoaded() { throw new Error("Not implemented"); }

    /**
     * Wait for condition
     * @abstract
     * @param {String} condition condition to execute in tab
     * @param {WaitOption} [waitOption] wait option
     * @param {ExecuteOption} [executeOption] execute option
	 * @returns {Promise<Object>}
	 */
	async waitForConditionAsync(condition, waitOption = {}, executeOption = {}) { throw new Error("Not implemented"); }
}