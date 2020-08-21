import LogHelper from "../foundation/helpers/LogHelper.js";
import TabScriptHelper from "../foundation/helpers/TabScriptHelper.js";

import FeatureProvider from "../features/FeatureProvider.js";
import FeatureExecutionContext from "../features/FeatureExecutionContext.js";
import MessageEventListener from "../features/background/MessageEventListener.js";
import OptionStateHandler from "../features/background/OptionStateHandler.js";
import TabStateHandler from "../features/background/TabStateHandler.js";
import PageEventParser from "../features/pageEvent/PageEventParser.js";
import PageEventsHandler from "../features/pageEvent/PageEventsHandler.js";

import BadgeTextHandler from "./background/BadgeTextHandler.js";
import BypassInvalidCertEventListener from "./background/BypassInvalidCertEventListener.js";
import GenericMessageHandler from "./background/GenericMessageHandler.js";
import NotificationEventListener from "./background/NotificationEventListener.js";
import TabEventListener from "./background/TabEventListener.js";

/**
 * Background Script Feature Provider class
 */
export default class BackgroundScriptFeatureProvider extends FeatureProvider {
    /**
     * Creates a new instance of Background Script Feature Provider
     */
    constructor() {
        LogHelper.logGroupStart("Feature Registration");
        const features = [];
        new BadgeTextHandler().RegisterFeature(features);
        new BypassInvalidCertEventListener().RegisterFeature(features);
        new GenericMessageHandler().RegisterFeature(features);
        new NotificationEventListener().RegisterFeature(features);
        new TabEventListener().RegisterFeature(features);

        new MessageEventListener().RegisterFeature(features);
        new OptionStateHandler().RegisterFeature(features);
        new TabStateHandler().RegisterFeature(features);
        new PageEventParser().RegisterFeature(features);
        new PageEventsHandler().RegisterFeature(features);

        super("background", features);
        LogHelper.logGroupEnd();
    }

    /**
     * @param {String} eventName event name
     * @param {Object} [eventArg] event argument
     */
    async RunAsync(eventName, eventArg) {
        const executionContext = new FeatureExecutionContext(this.scriptName, eventName, eventArg, this.tabId, this.options);
        executionContext.ScriptHelper = new TabScriptHelper(this.tabId, this.options);
        return super.RunWithContextAsync(executionContext);
    }
}