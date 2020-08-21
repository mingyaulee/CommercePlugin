import LogHelper from "../foundation/helpers/LogHelper.js";
import TabScriptHelper from "../foundation/helpers/TabScriptHelper.js";

import FeatureProvider from "../features/FeatureProvider.js";
import FeatureExecutionContext from "../features/FeatureExecutionContext.js";
import MessageEventListener from "../features/background/MessageEventListener.js";
import OptionStateHandler from "../features/background/OptionStateHandler.js";
import TabStateHandler from "../features/background/TabStateHandler.js";
import PageEventParser from "../features/pageEvent/PageEventParser.js";

import Initialize from "./popup/Initialize.js";
import AutomationsComponent from "./popup/AutomationsComponent.js";
import CurrentEventsComponent from "./popup/CurrentEventsComponent.js";
import BypassInvalidCertComponent from "./popup/BypassInvalidCertComponent.js";

/**
 * Popup Script Feature Provider class
 */
export default class PopupPageFeatureProvider extends FeatureProvider {
    /**
     * Creates a new instance of Popup Script Feature Provider
     */
    constructor() {
        LogHelper.logGroupStart("Feature Registration");
        const features = [];
        new Initialize().RegisterFeature(features);
        new AutomationsComponent().RegisterFeature(features);
        new BypassInvalidCertComponent().RegisterFeature(features);
        new CurrentEventsComponent().RegisterFeature(features);

        new MessageEventListener().RegisterFeature(features);
        new OptionStateHandler().RegisterFeature(features);
        new TabStateHandler().RegisterFeature(features);
        new PageEventParser().RegisterFeature(features);

        super("popup", features);
        LogHelper.logGroupEnd();
    }

    /**
     * @override
     * @param {String} eventName event name
     * @param {Object} [eventArg] event argument
     */
    async RunAsync(eventName, eventArg) {
        const executionContext = new FeatureExecutionContext(this.scriptName, eventName, eventArg, this.tabId, this.options);
        executionContext.ScriptHelper = new TabScriptHelper(this.tabId, this.options);
        return super.RunWithContextAsync(executionContext);
    }
}