import CommonHelper from "../../foundation/helpers/CommonHelper.js";
import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";
import StateHandler from "../../foundation/modules/StateHandler.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";

const NotificationState = new StateHandler({ click: null, tabId: 0, timeout: 0 });

/**
 * Notification Event Listener feature
 */
export default class NotificationEventListener extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.Background.Initialize:
                this.initializeListeners(executionContext);
                return;
            case FeatureEvents.Notification.Send:
                return await this.sendNotificationAsync(executionContext);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Initialize listeners
     * @param {FeatureExecutionContext} executionContext execution context
     */
    initializeListeners(executionContext) {
        this.featureProvider = executionContext.FeatureProvider;
        globalThis.browser?.notifications?.onClicked?.addListener(this.onNotificationClick.bind(this));
    }

    /**
     * On notification click handler
     * @param {String} notificationId notification id
     */
    onNotificationClick(notificationId) {
        const notification = NotificationState.get(notificationId);
        if (notification.click) {
            switch (notification.click) {
                case "focusTab":
                    ExtensionHelper.switchToTabAsync(Number(notification.tabId));
                    break;
            }
            NotificationState.remove(notificationId);
        }
    }

    /**
     * Send notification
     * @param {FeatureExecutionContext} executionContext execution context
     * @returns {Promise<String>} notification id
     */
    async sendNotificationAsync(executionContext) {
        const notificationOption = executionContext.EventArg;
        const notificationId = notificationOption.id || CommonHelper.guid();
        const notification = {
            iconUrl: "../Icons/icon" + (notificationOption.icon ? "-" + notificationOption.icon : "") + ".png",
            type: "basic",
            title: notificationOption.title || ExtensionHelper.getExtensionName(),
            message: notificationOption.message || "",
            requireInteraction: notificationOption.persist || false
        };
    
        if (notificationOption.update) {
            globalThis.clearTimeout(NotificationState.get(notificationId).timeout);
            await globalThis.browser.notifications.clear(notificationId)
            await globalThis.browser.notifications.create(notificationId, notification);
        } else {
            await globalThis.browser.notifications.create(notificationId, notification);
        }
    
        if (notificationOption.click) {
            NotificationState.update({ id: notificationId, click: notificationOption.click, tabId: notificationOption.tabId });
        }
    
        if (!notificationOption.persist) {
            NotificationState.update({
                id: notificationId,
                timeout: globalThis.setTimeout(() => globalThis.browser.notifications.clear(notificationId), executionContext.Options.Common.NotificationTimeout)
            });
        }
    
        return notificationId;
    }
}