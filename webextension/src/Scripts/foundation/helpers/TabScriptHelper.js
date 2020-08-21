import StateHandler from "../modules/StateHandler.js";
import QueryString, { QueryValueCollection } from "../modules/QueryString.js";
import BaseScriptHelper, * as BaseScriptHelperExports from "./BaseScriptHelper.js";
import CommonHelper from "./CommonHelper.js";
import ExtensionHelper from "./ExtensionHelper.js";
import LogHelper from "./LogHelper.js";

const TabState = new StateHandler();
const WindowMessageState = new StateHandler();

function handleWindowMessage(message) {
    const messageHandler = WindowMessageState.get(message.id);
    if (messageHandler) {
        LogHelper.log(`Found message handler for message id ${message.id}`, messageHandler);
        if (messageHandler.frameId !== message.frameId) {
            return;
        }

        WindowMessageState.remove(message.id);
        if (message.error) {
            LogHelper.error("Automation script error: " + message.error);
        }
        LogHelper.log(`Message handler received message id ${message.id}`);
        messageHandler.resolve(typeof (message.result) === "string" ? JSON.parse(message.result) : message.result);
    }
}

function escapeCode(code) {
    return code.replace(/\`/g, "\\`").replace(/\\/g, "\\\\").replace(/\$\{/g, "\\${");
}

/**
 * @extends BaseScriptHelper
 */
export default class TabScriptHelper extends BaseScriptHelper {
    tabId;
    automationOptions;

    /**
     * Creates a new tab script helper
     * @param {Number} tabId tab id
     * @param {Object} options tab id
     */
    constructor(tabId, options) {
        super();
        this.tabId = tabId;
        this.options = options;
        this.setupMessageListener();
    }

    /**
     * Executes the code block in tab
     * @override
     * @param {String} code code to execute
     * @param {BaseScriptHelperExports.ExecuteOption} executeOption execute option
     */
    async executeScriptAsync(code, executeOption = {}) {
        return this.executeAsync({ ...executeOption, code: code });
    }

    /**
     * Execute in tab with the option
     * @param {BaseScriptHelperExports.ExecuteOption} executeOption execute option
     */
    async executeAsync(executeOption) {
        /** @type {object} */
        const chromeExecuteOption = {};
        return new Promise(resolve => {
            const frameId = executeOption.frameId || "";
            if (executeOption.frameId) {
                chromeExecuteOption.allFrames = true;
            }

            const singleLineCode = executeOption.code.indexOf("\n") === -1 && executeOption.code.indexOf("return ") !== 0;
            const id = CommonHelper.guid();

            chromeExecuteOption.code = `(function () {
                const frameId = "${frameId}".toLowerCase();
                if (frameId) {
                    const currentFrameId = window.frameElement ? "#" + window.frameElement.id.toLowerCase() : window.name ? "#" + window.name.toLowerCase() : "";
                    const currentFrameSrc = window.frameElement ? window.frameElement.src.toLowerCase() : "";
                    if (currentFrameId !== frameId && currentFrameSrc.indexOf(frameId) === -1) {
                        return;
                    }
                }

                if (document.getElementById("webkit-xml-viewer-source-xml")) {
                    reject("Script is not executed in XML viewer page");
                    return;
                }
        
                const scriptTag = document.createElement('script');
                const script = \`(async () => {
                    let logger = () => {};
                    if (${this.options.Common.Debug}) {
                        logger = console.log;
                    }
                    let $error;
                    let $result = null;
                    try {
                        $result = await (async () => {
                            ${escapeCode(singleLineCode ? "return " + executeOption.code + ";" : executeOption.code)}
                        })();
                    } catch (e) {
                        logger("Script injection error ${id}", e);
                        $error = e.message;
                    }
                    logger("Script injection from ${this.constructor.name} ${id} ${escapeCode(singleLineCode ? `\\n${executeOption.code.replace(/\"/g, `\\"`)}\\n` : "")}", $result);
                    const message = {
                        id: "${id}",
                        tabId: ${this.tabId},
                        frameId: "${frameId}",
                        topWindow: window.top === window,
                        result: JSON.stringify($result),
                        error: $error
                    };
                    const postMessage = () => {
                        if ((window.top === window || window.frameElement !== null) && window.top.windowUnloading === undefined) {
                            // if (this is the current window or the frame has access to parent window) and the content script is not injected yet
                            setTimeout(postMessage, 500);
                            return;
                        }
                        logger("Posted message for ${id}");
                        window.top.postMessage(message, "*");
                    };
                    postMessage();
                })();\`;
                const scriptBody = document.createTextNode(script);
                scriptTag.appendChild(scriptBody);
                document.body.append(scriptTag);
            })();`;

            WindowMessageState.update({
                id: id,
                frameId: frameId,
                resolve: resolve
            });

            const executeScriptInTab = async () => {
                try {
                    await globalThis.browser.tabs.executeScript(this.tabId, chromeExecuteOption);
                } catch (error) {
                    if (error.message === "The tab was closed.") {
                        // the tab is redirecting to another page
                        setTimeout(executeScriptInTab, 500);
                    } else {
                        throw error;
                    }
                }
            };

            executeScriptInTab();
        });
    }

    /**
     * @override
     */
    async getDocumentTitleAsync() {
        return this.executeScriptAsync(`document.title`);
    }

    /**
     * @override
     */
    async getFullUrlAsync() {
        return this.executeScriptAsync(`document.location.href`);
    }

    /**
     * @override
     */
    async getUrlHostAsync() {
        return this.executeScriptAsync(`document.location.host`);
    }

    /**
     * @override
     * @param {String} str input
     */
    async urlContainsAsync(str) {
        return this.executeScriptAsync(`document.location.href.toLowerCase().indexOf("${str}".toLowerCase()) > -1`);
    }

    /**
     * @override
     * @param {String} str input
     */
    async queryContainsAsync(str) {
        return this.executeScriptAsync(`document.location.search.toLowerCase().indexOf("${str}".toLowerCase()) > -1`);
    }

    /**
     * @override
     * @param {String} [key] query key
     * @returns {Promise<QueryString|QueryValueCollection>}
     */
    async getQueryAsync(key) {
        const queryString = await this.executeScriptAsync(`document.location.search.substring(1)`);
		const dict = QueryString.Parse(queryString);		
		if (key === undefined) {
			return dict;
		}
		return dict[key];
	}

    /**
     * @override
     * @param {String} url url to redirect to
     */
    async redirectToAsync(url) {
        await ExtensionHelper.redirectTabToUrlAsync(this.tabId, url);
        const tabInfo = await ExtensionHelper.getTabAsync(this.tabId);
        if (tabInfo.title === "Privacy error") {
            await CommonHelper.waitFor(500);
        }
        return this.waitForDocumentLoaded();
    }

    /**
     * @override
     * @param {String} frameId "#frameId" or "/frame/url"
     */
    async checkFrameExistAsync(frameId) {
        return new Promise(resolve => {
            let responseReceived = false;
            this.executeScriptAsync(`true`, { frameId: frameId }).then(() => {
                responseReceived = true;
                resolve(true);
            });
            setTimeout(() => {
                if (responseReceived === false) {
                    resolve(false);
                }
            }, 1000);
        });   
    }

    /**
     * @override
     * @param {String} frameId "#frameId" or "/frame/url"
     */
    async waitForFrameExistAsync(frameId) {
        return this.waitForConditionAsync(`true`, {}, { frameId: frameId });
    }

    /**
     * @override
     */
    async waitForDocumentLoaded() {
        return this.waitForConditionAsync(`document.readyState === "complete" && window.top.windowUnloading === false`, { delayMs: 1000 });
    }

    /**
     * @override
     * @param {String} condition condition to execute in tab
     * @param {BaseScriptHelperExports.WaitOption} waitOption wait option
     * @param {BaseScriptHelperExports.ExecuteOption} executeOption execute option
	 * @returns {Promise<Object>}
     */
    async waitForConditionAsync(condition, waitOption = {}, executeOption = {}) {
        return new Promise((resolve, reject) => {
            const startTime = new Date().getTime();
            const maxEndTime = startTime + (waitOption.timeoutMs || this.options.Automations.TimeoutMs);
            const checkCondition = async () => {
                let result = false;
                try {
                    result = await this.executeScriptAsync(condition, executeOption);
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
        const tabState = TabState.get(this.tabId);
        if (tabState && tabState.messageListener) {
            return;
        }
        const messageListener = (request, sender, sendResponse) => {
            if (request.windowMessage) {
                LogHelper.log(`Received message from tab id ${this.tabId}`, request.windowMessage);
                if (request.windowMessage.tabId !== this.tabId) {
                    return;
                }

                handleWindowMessage(request.windowMessage);
            }
        };
        TabState.update({
            id: this.tabId,
            messageListener: messageListener
        });
        globalThis.browser.runtime.onMessage.addListener(messageListener);
    }
}