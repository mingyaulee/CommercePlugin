import Feature from "../Feature.js";
import FeatureEvents from "../FeatureEvents.js";
import FeatureExecutionContext from "../FeatureExecutionContext.js";

/**
 * Tab Event Listener feature
 */
export default class MessageEventListener extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Background.Initialize:
                this.initializeListeners(executionContext);
                return;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize listeners
     * @param {FeatureExecutionContext} executionContext execution context
     */
    initializeListeners(executionContext) {
        this.featureProvider = executionContext.FeatureProvider;
        globalThis.browser?.runtime?.onMessage?.addListener(this.onMessageAsync.bind(this));
    }
    
    /**
     * On message handler
     * @param {Object} message message
     * @param {Object} sender sender
     */
    async onMessageAsync(message, sender) {
        // Message communication between Script Helpers
        if (message.windowMessage) {
            return;
        }
        return new Promise(resolve => {
            this.featureProvider.tabId = sender?.tab?.id || this.featureProvider.tabId;

            if (message.eventName) {
                this.featureProvider.RunAsync(message.eventName, message.eventArg).then(resolve);
                return;
            }

            this.featureProvider.RunAsync(FeatureEvents.Background.MessageReceived, { message: message, sender: sender }).then(resolve);
        });
    }
}