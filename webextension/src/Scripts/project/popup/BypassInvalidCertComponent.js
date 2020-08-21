import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";

/**
 * Bypass Invalid Cert Component feature
 */
export default class BypassInvalidCertComponent extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case ProjectEvents.Page.PageLoaded:
                return await this.initializeAsync(executionContext);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize component
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async initializeAsync(executionContext) {
        this.tabId = executionContext.TabId;
        this.button = globalThis.document.getElementById("bypassCertSecurityButton");
        if (this.button) {
            this.attachEventListener();
        }
        await this.checkTabStateInvalidCertAsync(executionContext);
    }

    /**
     * Attach on click event listeners to button
     */
    attachEventListener() {
        this.button.addEventListener("click", this.bypassCertSecurityAsync.bind(this));
    }

    /**
     * Load current events
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async checkTabStateInvalidCertAsync(executionContext) {
        const tabState = await executionContext.FeatureProvider.RunAsync(FeatureEvents.Tab.GetTabState);
        if (tabState.invalidCert) {
            //this.button.classList.remove("d-none");
            await this.bypassCertSecurityAsync();
        }
    }

    /**
     * Bypass certificate security
     */
    async bypassCertSecurityAsync() {
        await ExtensionHelper.sendMessageAsync({
            eventName: ProjectEvents.Tab.BypassCertificateSecurity,
            eventArg: this.tabId
        });
    }
}