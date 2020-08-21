import DefaultOption from "../DefaultOption.js";
import Option from "../modules/Option.js";

const state = {
	extensionName: null,
	badgeText: null
}

const emptyPromise = new Promise(() => {});

const getFinalOptionObj = (optionObj, defaultOptionObj) => {
    const finalOptionObj = {};
    for (const optionKey in defaultOptionObj) {
        if (optionObj.hasOwnProperty(optionKey) === false) {
            finalOptionObj[optionKey] = defaultOptionObj[optionKey];
        } else {
            finalOptionObj[optionKey] = optionObj[optionKey];
            if (typeof(finalOptionObj[optionKey]) === "object" && finalOptionObj[optionKey].constructor !== Array) {
                finalOptionObj[optionKey] = getFinalOptionObj(optionObj[optionKey], defaultOptionObj[optionKey]);
            }
        }
    }
    return finalOptionObj;
};

export default class ExtensionHelper {
	/**
	 * Gets the extension name
	 * @returns {String}
	 */
	static getExtensionName() {
		if (state.extensionName === null) {
			state.extensionName = globalThis.browser?.runtime?.getManifest()?.name;
		}
		return state.extensionName;
	}

	/**
	 * Gets the extension options
	 * @returns {Promise<Object>}
	 */
    static getOptionsAsync() {
		if (globalThis.chrome) {
			return new Promise(resolve => {
				globalThis.chrome.storage?.sync?.get(optionObj => {
					if (!optionObj) {
						optionObj = {};
					}
					const finalOptionObj = getFinalOptionObj(optionObj, DefaultOption);
					resolve(Option.Parse(finalOptionObj, finalOptionObj));
				});
			});
		}
		return globalThis.browser?.storage?.sync?.get()
			.then(optionObj => {
				if (!optionObj) {
					optionObj = {};
				}
				const finalOptionObj = getFinalOptionObj(optionObj, DefaultOption);
				return Option.Parse(finalOptionObj, finalOptionObj);
			});	
	}

	/**
	 * Navigate to options page
	 */
    static goToOptionsPage() {
		if (globalThis.browser.runtime.openOptionsPage) {
			globalThis.browser.runtime.openOptionsPage();
		} else {
			globalThis.window.open(this.getURL("Views/options.html"));
		}
	}

	/**
	 * Gets the full URL relative to the chrome extension root path
	 * @param {String} url url
	 */
	static getURL(url){
		return globalThis.browser.runtime.getURL(url);
	}

	/**
	 * Creates a new tab
	 * @param {Object} createData create data
	 */
	static createTabAsync(createData) {
		if (globalThis.browser.windows) {
			return globalThis.browser.windows.create(createData);
		} else {
			return ExtensionHelper.sendMessageAsync({
                scope: ExtensionHelper.name,
                command: ExtensionHelper.createTabAsync.name,
                arguments: [ createData ]
            });
		}
	}

	/**
	 * Activates the tab
	 * @param {Number} tabId tab id
	 * @returns {Promise<Object>}
	 */
	static switchToTabAsync(tabId) {
		if (!tabId) {
			return emptyPromise;
		}

		if (globalThis.browser.tabs) {
			return globalThis.browser.tabs.get(tabId)
				.then(tab => {
					globalThis.browser.windows.update(tab.windowId, { focused: true });
					globalThis.browser.tabs.update(tabId, { active: true });
				})
				.catch(() => {});
		} else {
			return ExtensionHelper.sendMessageAsync({
                scope: ExtensionHelper.name,
                command: ExtensionHelper.switchToTabAsync.name,
                arguments: [ tabId ]
            });
		}
	}
	
	/**
	 * Redirects the tab to url
	 * @param {Number} tabId tab id
	 * @param {String} url url
	 * @returns {Promise<Object>}
	 */
	static redirectTabToUrlAsync(tabId, url) {
		return globalThis.browser?.tabs?.update(tabId, { url: url });
	}

	/**
	 * Gets the tab information
	 * @param {Number} tabId tab id
	 * @returns {Promise<Object>} tab
	 */
	static getTabAsync(tabId) {
		return globalThis.browser?.tabs?.get(tabId);
	}

	/**
	 * Gets the tab id of the active tab
	 * @returns {Promise<Number>}
	 */
	static getActiveTabAsync() {
		return globalThis.browser?.tabs?.query({ active: true, currentWindow: true })
			.then(tabs => tabs[0].id);
	}

	/**
	 * Sends a message to other runtime listeners
	 * @param {Object} message message
	 * @returns {Promise<Object>}
	 */
	static sendMessageAsync(message) {
		return new Promise((resolve, reject) => {
			try {
				globalThis.browser?.runtime?.sendMessage(message)
					.then(resolve);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Sets the badge text
	 * @param {String} text badge text
	 * @param {Number} [tabId] tab id
	 */
	static setBadgeText(text, tabId) {
		var newBadgeText = text;
		if (state.badgeText !== newBadgeText) {
			state.badgeText = newBadgeText;
			globalThis.browser?.browserAction?.setBadgeText({
                text: newBadgeText,
                tabId: tabId
			});
		}
	}
}