import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import SitecoreTabEventListener from "../sitecore/SitecoreTabEventListener.js";

/**
 * Tab Event Listener feature
 */
export default class TabEventListener extends Feature {
    /**
     * @override
     * @param {Feature[]} features features array
     */
    RegisterFeature(features) {
        super.RegisterFeature(features);
        new SitecoreTabEventListener().RegisterFeature(features);
    }

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
        globalThis.browser?.tabs?.onUpdated?.addListener(this.onTabUpdated.bind(this));
        globalThis.browser?.tabs?.onRemoved?.addListener(this.onTabRemoved.bind(this));
        globalThis.browser?.webNavigation?.onErrorOccurred?.addListener(this.onNavigationError.bind(this));
    }

    /**
     * On tab updated event
     * @param {Number} tabId tab id
     * @param {Object} changeInfo change info
     * @param {Object} tab tab
     */
    onTabUpdated(tabId, changeInfo, tab) {
        this.featureProvider.tabId = tabId;
        this.featureProvider.RunAsync(FeatureEvents.Tab.TabUpdated, changeInfo);
    }

    /**
     * On tab removed event
     * @param {Number} tabId tab id
     * @param {Object} removeInfo remove info
     */
    onTabRemoved(tabId, removeInfo) {
        this.featureProvider.tabId = tabId;
        this.featureProvider.RunAsync(FeatureEvents.Tab.TabRemoved, removeInfo);
    }

    /**
     * On navigation error event
     * @param {Object} details details
     */
    onNavigationError(details) {
        this.featureProvider.tabId = details.tabId;
        this.featureProvider.RunAsync(FeatureEvents.Tab.NavigationError, details);
    }
}