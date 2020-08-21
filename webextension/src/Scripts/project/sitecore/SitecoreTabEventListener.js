import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

const state = {
    handledHostNames: [],
    redirectedHostNames: []
};

/**
 * Sitecore Tab Event Listener feature
 */
export default class SitecoreTabEventListener extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Tab.NavigationError:
                this.onNavigationError(executionContext);
                return;
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * On tab navigation error handler
     * @param {FeatureExecutionContext} executionContext execution context
     */
    onNavigationError(executionContext) {
        const details = executionContext.EventArg;
        if (details.url.toLowerCase().indexOf("-identityserver") > -1) {
            this.handleIdentityServerError(executionContext, details);
        }
    }

    /**
     * Handle Identity Server navigation error
     * @param {FeatureExecutionContext} executionContext execution context
     * @param {Object} details error detail
     */
    handleIdentityServerError(executionContext, details) {
        const url = details.url.toLowerCase();
        const hostName = url.substring(url.indexOf("//") + 2, url.indexOf("-identityserver"));
        const identityServerHostName = hostName + "-identityserver";
        const redirectUrl = "https://" + hostName + "/sitecore";

        if (hostName.indexOf("/") === -1) {
            const ipAddressErrors = ["net::ERR_CONNECTION_REFUSED", "net::ERR_CONNECTION_RESET", "net::ERR_NAME_NOT_RESOLVED", "net::ERR_CONNECTION_TIMED_OUT"];
            if (ipAddressErrors.indexOf(details.error) > -1) {
                this.handleIPAddressMappingErrorAsync(executionContext, details.tabId, hostName, identityServerHostName, redirectUrl);
            } else if (details.error === "net::ERR_ABORTED") {
                this.handleAbortedFormSubmission(executionContext, details.tabId, hostName, redirectUrl);
            }
        }
    }

    /**
     * Handle IP address mapping error for Identity Server
     * @param {FeatureExecutionContext} executionContext execution context
     * @param {Number} tabId tab id
     * @param {String} hostName host name
     * @param {String} identityServerHostName identity server host name
     * @param {String} redirectUrl redirect url
     */
    async handleIPAddressMappingErrorAsync(executionContext, tabId, hostName, identityServerHostName, redirectUrl) {
        if (state.handledHostNames.indexOf(hostName) === -1) {
            state.handledHostNames.push(hostName);
            globalThis.setTimeout(() => state.handledHostNames = state.handledHostNames.filter(x => x !== hostName), 60000);

            // Identity Server IP address is not mapped in the host file
            const notificationId = await executionContext.FeatureProvider.RunAsync(
                FeatureEvents.Notification.Send,
                {
                    icon: "info",
                    message: `Adding IP address to host file ${identityServerHostName}`
                }
            );

            const result = await this.addIpAddressToHostFileAsync(executionContext.Options.Common.NodeServerUrl, hostName, identityServerHostName);

            if (result && result.success && result.data.includes("ok")) {
                await executionContext.FeatureProvider.RunAsync(
                    FeatureEvents.Notification.Send,
                    {
                        id: notificationId,
                        update: true,
                        icon: "success",
                        message: `Added IP address to host file, redirecting to ${redirectUrl}`
                    }
                );
                ExtensionHelper.redirectTabToUrlAsync(tabId, redirectUrl);
            } else {
                await executionContext.FeatureProvider.RunAsync(
                    FeatureEvents.Notification.Send,
                    {
                        id: notificationId,
                        update: true,
                        icon: "fail",
                        message: `Failed to add IP address to host file ${identityServerHostName}${result === false ? ", make sure node service is running" : ""}`
                    }
                );
            }
        }
    }

    /**
     * Adds host name IP address mapping
     * @param {String} nodeServerUrl node server url
     * @param {String} hostName host name
     * @param {String} identityServerHostName identity server host name
     */
    async addIpAddressToHostFileAsync(nodeServerUrl, hostName, identityServerHostName) {
        try {
            const result = await fetch(`${nodeServerUrl}?action=resolveHostName&hostName=${encodeURIComponent(identityServerHostName)}&mapIpFromHostName=${encodeURIComponent(hostName)}`);
            return result.json();
        } catch {
            return false;
        }
    }

    /**
     * Handles aborted form submission in Identity Server
     * @param {FeatureExecutionContext} executionContext execution context
     * @param {Number} tabId tab id
     * @param {String} hostName host name
     * @param {String} redirectUrl redirect url
     */
    handleAbortedFormSubmission(executionContext, tabId, hostName, redirectUrl) {
        // Form submission to Identity Server does not work upon reloading
        if (state.redirectedHostNames.indexOf(hostName) === -1) {
            executionContext.FeatureProvider.RunAsync(
                FeatureEvents.Notification.Send,
                {
                    icon: "info",
                    message: "Redirecting to " + redirectUrl
                }
            );

            state.redirectedHostNames.push(hostName);
            globalThis.setTimeout(() => state.redirectedHostNames = state.redirectedHostNames.filter(x => x !== hostName), 60000);
            ExtensionHelper.redirectTabToUrlAsync(tabId, redirectUrl);
        }
    }
}