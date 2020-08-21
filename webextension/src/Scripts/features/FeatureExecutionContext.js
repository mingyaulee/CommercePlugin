import BaseScriptHelper from "../foundation/helpers/BaseScriptHelper.js";

import FeatureProvider from "./FeatureProvider.js";

export default class FeatureExecutionContext {
    /** @type {String} */
    ScriptName;
    /** @type {String} */
    EventName;
    /** @type {Object} */
    EventArg;
    /** @type {Number} */
    TabId;
    /** @type {Object} */
    Options;
    /** @type {BaseScriptHelper} */
    ScriptHelper;
    /** @type {FeatureProvider} */
    FeatureProvider;
    /** @type {Object} */
    ContextItems;

    /**
     * Creates a new instance of Feature Execution Context
     * @param {String} scriptName script name
     * @param {String} eventName event name
     * @param {Object} eventArg event argument
     * @param {Number} tabId tab id
     * @param {Object} options options
     */
    constructor(scriptName, eventName, eventArg, tabId, options) {
        this.ScriptName = scriptName;
        this.EventName = eventName;
        this.EventArg = eventArg;
        this.TabId = tabId;
        this.Options = options;
    }
}