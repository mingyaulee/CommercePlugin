import Feature from "./Feature.js";
import FeatureExecutionContext from "./FeatureExecutionContext.js";

/**
 * Feature provider
 * @class
 */
export default class FeatureProvider {
    /**
     * Creates a new feature provider
     * @param {String} scriptName script name
     * @param {Feature[]} features
     */
    constructor(scriptName, features) {
        /** @type {String} */
        this.scriptName = scriptName;
        /** @type {Number} */
        this.tabId = null;
        /** @type {Object} */
        this.options = null;
        this.features = features;
        this.contextItems = {};
    }

    /**
     * Executes all features
     * @abstract
     * @param {String} eventName event name
     * @param {Object} [eventArg] event argument
     * @returns {Promise}
     */
    async RunAsync(eventName, eventArg) { throw new Error("Not implemented."); }

    /**
     * Executes all features with execution context
     * @param {FeatureExecutionContext} executionContext execution context
     * @returns {Promise}
     */
    async RunWithContextAsync(executionContext) {
        executionContext.FeatureProvider = this;
        executionContext.ContextItems = this.contextItems;
        const promises = [];
        this.features.forEach(feature => {
            promises.push(feature.OnAsync(executionContext));
        });
        return Promise.all(promises).then(resultsArray => {
            const results = resultsArray.filter(result => result !== Feature.EmptyExecutionResult);
            if (results.length === 1) {
                return results[0];
            }
            return results;
        });
    }
}