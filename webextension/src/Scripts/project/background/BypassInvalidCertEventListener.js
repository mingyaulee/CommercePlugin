import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

import ProjectEvents from "../ProjectEvents.js";

/**
 * Bypass Invalid Cert Event Listener feature
 */
export default class BypassInvalidCertEventListener extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Tab.TabUpdated:
                return await this.onTabUpdatedAsync(executionContext);
            case FeatureEvents.Tab.NavigationError:
                return await this.onNavigationErrorAsync(executionContext);
            case ProjectEvents.Tab.BypassCertificateSecurity:
                return await this.bypassCertificateSecurityAsync(executionContext, executionContext.EventArg);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * On tab updated handler
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async onTabUpdatedAsync(executionContext) {
        const changeInfo = executionContext.EventArg;
        if (changeInfo.status === "loading") {
            // Tab is redirecting to another URL
            await executionContext.FeatureProvider.RunAsync(FeatureEvents.Tab.UpdateTabState, { id: executionContext.TabId, invalidCert: false });
        } else if (changeInfo.status === "complete") {
            const tabState = await executionContext.FeatureProvider.RunAsync(FeatureEvents.Tab.GetTabState);
            if (tabState.autoBypassInvalidCert) {
                if (tabState.invalidCert) {
                    this.bypassCertificateSecurityAsync(executionContext, executionContext.TabId);
                } else if (tabState.autoBypassInvalidCert) {
                    await executionContext.FeatureProvider.RunAsync(FeatureEvents.Tab.UpdateTabState, { id: executionContext.TabId, autoBypassInvalidCert: false });
                }
            }
        }
    }

    /**
     * On tab navigation error handler
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async onNavigationErrorAsync(executionContext) {
        const details = executionContext.EventArg;
        if (details.error === "net::ERR_CERT_INVALID" || details.error === "net::ERR_CERT_AUTHORITY_INVALID") {
            // Certificate invalid error
            await executionContext.FeatureProvider.RunAsync(FeatureEvents.Tab.UpdateTabState, { id: executionContext.TabId, invalidCert: true });
            ExtensionHelper.setBadgeText("__*__", executionContext.TabId);
        }
    }

    /**
     * Bypass certificate security
     * @param {FeatureExecutionContext} executionContext execution context
     * @param {Number} tabId tab id
     */
    async bypassCertificateSecurityAsync(executionContext, tabId) {
        await executionContext.FeatureProvider.RunAsync(FeatureEvents.Notification.Send, {
            icon: "info",
            message: "Trying to bypass certificate security"
        });

        await ExtensionHelper.switchToTabAsync(tabId);
        await fetch(`${executionContext.Options.Common.NodeServerUrl}?action=sendKeysToChrome`);

        return executionContext.FeatureProvider.RunAsync(FeatureEvents.Tab.UpdateTabState, { id: tabId, invalidCert: false, autoBypassInvalidCert: true });
    }
}