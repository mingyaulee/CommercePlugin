import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";
import LogHelper from "../../foundation/helpers/LogHelper.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

/**
 * Generic Message Handler feature
 */
export default class GenericMessageHandler extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Background.MessageReceived:
                return await this.onMessageReceivedAsync(executionContext);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize listeners
     * @param {FeatureExecutionContext} executionContext execution context
     */
    onMessageReceivedAsync(executionContext) {
        return new Promise(resolve => {
            const { message, sender } = executionContext.EventArg;
            let responseArg;
            if (message.scope) {
                /** @type {any} */
                let scope;
                if (message.scope === ExtensionHelper.name) {
                    scope = ExtensionHelper;
                } else if (message.scope === "sender") {
                    scope = sender;
                } else {
                    throw new Error("No matching scope found");
                }
    
                let target = scope;
                if (message.command) {
                    const commands = message.command.split(".");
                    for (const command of commands) {
                        if (target) {
                            scope = target;
                            target = target[command];
                        }
                    }
                }
    
                if (target instanceof Function) {
                    responseArg = target.apply(scope, message.arguments || []);
                } else if (target) {
                    responseArg = target;
                } else {
                    LogHelper.error("No response found for command or scope", message);
                }
            }
    
            if (responseArg instanceof Promise) {
                responseArg.then(resolve);
            } else {
                resolve(responseArg);
            }
        });
    }
}