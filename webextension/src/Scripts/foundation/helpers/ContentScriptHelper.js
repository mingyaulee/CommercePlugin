import StateHandler from "../modules/StateHandler.js";
import QueryString, { QueryValueCollection } from "../modules/QueryString.js";
import BaseScriptHelper, * as BaseScriptHelperExports from "./BaseScriptHelper.js";
import CommonHelper from "./CommonHelper.js";
import ExtensionHelper from "./ExtensionHelper.js";
import LogHelper from "./LogHelper.js";

const WindowMessageState = new StateHandler();

function handleWindowMessage(event) {
	if (event.source.top !== this.window.top) {
		return;
	}

    const message = event.data;
	const messageHandler = WindowMessageState.get(message.id);
	if (messageHandler) {
		WindowMessageState.remove(message.id);
		messageHandler.scriptTag.remove();
		if (message.error) {
			LogHelper.error("Script error: " + message.error);
		}
		messageHandler.resolve(typeof (message.result) === "string" ? JSON.parse(message.result) : message.result);
	} else {
        // Forward window message to background
		ExtensionHelper.sendMessageAsync({
			windowMessage: message
		});
	}
}

function escapeCode(code) {
    return code.replace(/"/g, "\\\"");
}

/**
 * Content Script Helper
 * @extends BaseScriptHelper
 */
export default class ContentScriptHelper extends BaseScriptHelper {
    static messageListener = false;

    /**
     * Creates a new content script helper
     * @param {Object} options options
     * @param {function(): Object} [globalThisGetter] getter function for globalThis
     */
    constructor(options, globalThisGetter) {
        super();
        this.options = options;
        this.globalThisGetter = globalThisGetter;
        this.setupMessageListener();
    }

    get globalThis() {
        return this.globalThisGetter ? this.globalThisGetter() : globalThis;
    }

    /**
     * Executes the script in page
     * @param {String} code code to execute
     */
    async executeScriptAsync(code) {
        return new Promise((resolve, reject) => {
            const singleLineCode = code.indexOf("\n") === -1 && code.indexOf("return ") !== 0;
            const id = CommonHelper.guid();

            if (this.globalThis.document.getElementById("webkit-xml-viewer-source-xml")) {
                reject("Script is not executed in XML viewer page");
                return;
            }

            const scriptTag = this.globalThis.document.createElement('script');
            const script = `(async () => {
                let logger = () => {};
                if (${this.options.Common.Debug}) {
                    logger = console.log;
                }
                let $error;
                let $result = null;
                try {
                    $result = await (async () => {
                        ${singleLineCode ? "return " + code + ";" : code}
                    })();
                } catch (e) {
                    logger("Script injection error ${id}", e);
                    $error = e.message;
                }
                logger("Script injection ${this.constructor.name} ${id} ${singleLineCode ? `\\n${escapeCode(code)}\\n` : ""}", $result);
                const message = {
                    id: "${id}",
                    result: JSON.stringify($result),
                    error: $error
                }
                globalThis.window.postMessage(message, "*");
            })();`;
            const scriptBody = this.globalThis.document.createTextNode(script);
            scriptTag.appendChild(scriptBody);

            WindowMessageState.update({
                id: id,
                resolve: resolve,
                scriptTag: scriptTag
            });

            this.globalThis.document.body.append(scriptTag);
        });
    }

    /**
     * @override
     */
    async getDocumentTitleAsync() {
        return this.globalThis.document.title;
    }

    /**
     * Gets the current document location
     * @returns {Location}
     */
    getDocumentLocation() {
		return this.globalThis.document.location;
	}

    /**
     * @override
     */
    async getFullUrlAsync() {
        return this.getDocumentLocation().href;
    }

    /**
     * @override
     */
    async getUrlHostAsync() {
        return this.getDocumentLocation().host;
    }

    /**
     * @override
     * @param {String} str input
     */
    async urlContainsAsync(str) {
        return this.getDocumentLocation().href.toLowerCase().indexOf(str.toLowerCase()) > -1;
    }

    /**
     * @override
     * @param {String} str input
     */
    async queryContainsAsync(str) {
        return this.getDocumentLocation().search.toLowerCase().indexOf(str.toLowerCase()) > -1;
    }

    /**
     * @override
     * @param {String} [key] query key
     * @returns {Promise<QueryString|QueryValueCollection>}
     */
    async getQueryAsync(key) {
		const queryString = this.getDocumentLocation().search.substring(1);
		const dict = QueryString.Parse(queryString);		
		if (key === undefined) {
			return dict;
		}
		return dict[key];
	}

    /**
     * @override
	 * @param {String} url url to redirect to
	 * @returns {Promise<Object>}
     */
    async redirectToAsync(url) {
        this.globalThis.document.location.replace(url);
	}

    /**
     * @override
	 * @returns {Promise<Object>}
     */
    async waitForDocumentLoaded() {
        return this.waitForConditionAsync(`document.readyState === "complete" && window.top.windowUnloading === false`, { delayMs: 1000 });
	}

    /**
     * @override
     * @param {String} condition condition to execute in tab
     * @param {BaseScriptHelperExports.WaitOption} waitOption wait option
	 * @returns {Promise<Object>}
     */
    async waitForConditionAsync(condition, waitOption = {}, executeOption = {}) {
        return new Promise((resolve, reject) => {
            const startTime = new Date().getTime();
            const maxEndTime = startTime + (waitOption.timeoutMs || this.options.Automations.TimeoutMs);
            const checkCondition = async () => {
                let result = false;
                try {
                    result = await this.executeScriptAsync(condition);
                } catch {}
                if (!result) {
                    if (new Date().getTime() < maxEndTime) {
                        setTimeout(checkCondition, waitOption.pollMs || 1000);
                    } else {
                        reject(`Condition is not true after timeout ("${condition}")`);
                    }
                } else {
                    resolve();
                }
            };
            if (waitOption.delayMs) {
                setTimeout(checkCondition, waitOption.delayMs);
            } else {
                checkCondition();
            }
        });
    }

    setupMessageListener() {
        if (!this.globalThis.window._setupMessageListener) {
            this.globalThis.window._setupMessageListener = true;
            this.globalThis.window.addEventListener("message", handleWindowMessage.bind(this.globalThis), false);
        }
    }
}