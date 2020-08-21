import sinonChrome from "sinon-chrome";
//import * as common from "../src/Scripts/common.js";
import DefaultOption from "../src/Scripts/foundation/DefaultOption.js";

export default function (option) {
    option = option || {};
    option.chromeOptions = option.chromeOptions || DefaultOption;
    var spies = [];

    beforeAll(async () => {
        //// Spy on methods in common.js to mock behaviour and return value
        //spies.push(spyOn(common, "switchToTabAsync").and.callThrough());
        //spies.push(spyOn(common, "sendMessageAsync").and.callFake((message) => {
        //    if (option.chrome && globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.sendMessage) {
        //        globalThis.chrome.runtime.sendMessage(message, () => {});
        //    }
        //    return new Promise(resolve => {
        //        if (common.state.currentPage !== "background") {
        //            let responseArg;
        //            if (message.command || message.scope) {
        //                if (message.scope === "common" && message.command === "getEvents") {
        //                    responseArg = option.returnCurrentEvents || [];
        //                }
        //                if (message.scope === "sender" && message.command === "tab.id") {
        //                    responseArg = option.returnTabId || 0;
        //                }
        //                if (message.command === "sendNotification") {
        //                    responseArg = option.returnNotificationId || common.guid();
        //                }
        //                if (message.scope === "tab") {
        //                    responseArg = {
        //                        invalidCert: option.returnInvalidCert || false
        //                    };
        //                }
        //            }
        //            resolve(responseArg);
        //        }
        //    });
        //}));
        //spies.push(spyOn(common, "isDocumentReady").and.returnValue(true));
        //spies.push(spyOn(common, "isDocumentFocused").and.returnValue(true));
        //// @ts-ignore
        //spies.push(spyOn(common, "getDocumentLocation").and.callFake(() => {
        //    return {
        //        href: option.returnLocationHref || "",
        //        search: option.returnLocationSearch || (option.returnLocationHref && option.returnLocationHref.indexOf("?") > -1 ? option.returnLocationHref.substring(option.returnLocationHref.indexOf("?")) : "")
        //    };
        //}));
        //spies.push(spyOn(common, "log"));
        //spies.push(spyOn(common, "addEvent").and.callThrough());

        // Spy on document HTML elements related methods
        if (option.document) {
            globalThis.documentElements = {
                children: [],
                add: element => {
                    globalThis.documentElements.children.push(element);
                    return element;
                },
                getElementById: id => {
                    const matches = globalThis.documentElements.children.filter(element => element.id === id);
                    if (matches.length) {
                        return matches[0];
                    }
                    return null;
                }
            };
            spies.push(spyOn(globalThis.document, "createElement").and.callFake(tagName => globalThis.documentElements.add(new FakeHtmlElement(tagName, null))));
            spies.push(spyOn(globalThis.document, "getElementById").and.callFake(id => {
                if (globalThis.documentElements.getElementById(id)) {
                    return globalThis.documentElements.getElementById(id);
                }
                let element = new FakeHtmlElement("div", id);
                return globalThis.documentElements.add(element);
            }));
            spies.push(spyOn(globalThis.document, "querySelectorAll"));
        }

        // add Chrome Extensions API mocked with sinon-chrome
        if (option.chrome) {
            // @ts-ignore
            globalThis.chrome = sinonChrome;
            globalThis.chrome.runtime.id = "1";
            globalThis.browser = (await import("../src/Scripts/lib/browser-polyfill.js")).default;
        }
    });

    beforeEach(() => {
        // reset option
        for (let i in option) {
            if (i.indexOf("return") === 0) {
                option[i] = undefined;
            }
        }

        // reset sinon-chrome spies and mock the behaviour
        if (option.chrome) {
            // @ts-ignore
            globalThis.chrome.flush();

            // @ts-ignore
            globalThis.chrome.storage.sync.get.callsFake((defaultOption, callback) => defaultOption instanceof Function ? defaultOption(option.chromeOptions || undefined) : callback(option.chromeOptions || defaultOption));
            // @ts-ignore
            globalThis.chrome.storage.sync.set.callsFake((newOption, callback) => { option.chromeOptions = newOption; callback && callback(); });
            // @ts-ignore
            globalThis.chrome.tabs.get.callsFake((tabId, callback) => callback({ id: tabId, windowId: tabId }));
            // @ts-ignore
            globalThis.chrome.tabs.query.callsFake((query, callback) => callback([{ id: 600, windowId: 700 }]));
            // @ts-ignore
            globalThis.chrome.tabs.update.callsFake((tabId, updateInfo, callback) => callback());
            // @ts-ignore
            globalThis.chrome.windows.update.callsFake((windowId, updateInfo, callback) => callback());
            // @ts-ignore
            globalThis.chrome.runtime.getManifest.callsFake(() => option.chromeOptions.manifest || {});
            // @ts-ignore
            globalThis.chrome.notifications.create.callsFake((notificationId, notificationOption, callback) => callback(notificationId));
            // @ts-ignore
            globalThis.chrome.notifications.clear.callsFake((notificationId, callback) => callback());
        }

        // reset tracking for all the Jasmine function spies
        for (var i in spies) {
            spies[i].calls.reset();
        }

        // allow testing of setTimeout and setInterval
        jasmine.clock().install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
    });

    afterAll(() => {
        // Reset all the spies for sinon-chrome
        if (option.chrome) {
            // @ts-ignore
            globalThis.chrome.flush();
            globalThis.chrome = undefined;
            try { delete globalThis.chrome; } catch { }
        }
    });

    return option;
}

export class FakeHtmlElement {
    tagName = null;
    id = null;
    eventListeners = {};
    children = [];
    dataset = {};
    style = {};
    classList = {
        all: [],
        add: className => this.className += " " + className,
        contains: className => this.classList.all.indexOf(className) > -1,
        remove: className => this.classList.all = this.classList.all.filter(c => c !== className)
    };
    parent = null;

    constructor(tagName, id) {
        tagName = tagName;
        id = id;
    }
    addEventListener(type, handler) {
        this.eventListeners.hasOwnProperty(type) ? this.eventListeners[type].push(handler) : this.eventListeners[type] = [handler];
    }
    trigger(type) {
        for (let i = 0; i < (this.eventListeners[type] || []).length; i++) {
            this.eventListeners[type][i].apply(this, [{}]);
        }
    }
    appendChild(child) { child.parent = this; this.children.push(child); }
    remove() {
        if (this.parent && this.parent.children.indexOf(this) > -1) {
            this.parent.children = this.parent.children.filter(e => e !== this);
        }
    }
    get className() { return this.classList.all.join(" "); }
    set className(classes) { this.classList.all = classes.split(" ").filter(c => c !== ""); }

    withClass(className) { this.className = className; return this; }
}