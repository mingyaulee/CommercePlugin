import ExtensionHelper from "../../foundation/helpers/ExtensionHelper.js";
import PageHelper from "../../foundation/helpers/PageHelper.js";
import PageEvent, { PageEventIcon } from "../../foundation/modules/PageEvent.js";

import Feature from "../../features/Feature.js";
import FeatureEvents from "../../features/FeatureEvents.js";
import FeatureExecutionContext from "../../features/FeatureExecutionContext.js";
import BuildPageEvent, { BuildEventStatus } from "../../features/tfs/modules/BuildPageEvent.js";

const state = {
    listenToEvents: false
};

export default class TfsPageEventListener extends Feature {
    /**
     * @override
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async OnAsync(executionContext) {
        switch (executionContext.EventName) {
            case FeatureEvents.PageEvents.InitializeListeners:
                return await this.checkInitializeListenerAsync(executionContext);
            case FeatureEvents.PageEvents.CheckEvents:
                return await Promise.all([this.checkEventAsync(executionContext, new BuildPageEvent(), false)]);
            case FeatureEvents.PageEvents.CheckEventProgress:
                return await this.checkEventAsync(executionContext, executionContext.EventArg, true);
        }
        return await super.OnAsync(executionContext);
    }

    /**
     * Checks whether to initialize event listener
     * @param {FeatureExecutionContext} executionContext execution context
     */
    async checkInitializeListenerAsync(executionContext) {
        if (executionContext.Options.TFS.Url) {
            const fullUrl = await executionContext.ScriptHelper.getFullUrlAsync();
            const urlPattern = new RegExp(executionContext.Options.TFS.Url, "i");
            if (urlPattern.test(fullUrl)) {
                state.listenToEvents = true;
                executionContext.EventArg.listenToEvents = true;
            }
        }
    }
    /**
     * Check event state
     * @param {FeatureExecutionContext} executionContext execution context
     * @param {PageEvent} pageEvent page event
     * @param {Boolean} checkProgress if true check for existing event progress, otherwise check for new event
     */
    async checkEventAsync(executionContext, pageEvent, checkProgress) {
        if (!state.listenToEvents) {
            return;
        }

        switch (pageEvent.type) {
            case BuildPageEvent.Type:
                if (await Build.IsBuildPageAsync(executionContext)) {
                    if (!checkProgress) {
                        pageEvent = await Build.DetectBuildEventAsync(executionContext) ?? pageEvent;
                    }
                    if (checkProgress) {
                        await Build.CheckBuildEventProgressAsync(executionContext, /** @type {BuildPageEvent} */(pageEvent));
                        if (pageEvent.completed) {
                            ExtensionHelper.sendMessageAsync({
                                eventName: FeatureEvents.Notification.Send,
                                eventArg: {
                                    icon: pageEvent.icon,
                                    title: pageEvent.getTitle(),
                                    message: pageEvent.getStatusMessage(),
                                    click: "focusTab",
                                    persist: true,
                                    tabId: executionContext.TabId
                                }
                            });
                        }
                    }
                }
                break;
            default:
                break;
        }
        return pageEvent.id ? pageEvent : null;
    }
}

export class Build {
    /**
     * Checks whether the current page is a build page
     * @param {FeatureExecutionContext} executionContext execution context
     * @returns {Promise<Boolean>} true if the current page is a build page, otherwise false
     */
    static async IsBuildPageAsync(executionContext) {
        return await executionContext.ScriptHelper.urlContainsAsync("_build/results") &&
            await executionContext.ScriptHelper.queryContainsAsync("buildId=");
    }

    /**
     * Gets the build version
     * @param {FeatureExecutionContext} executionContext execution context
     * @returns {Promise<String>} build version
     */
    static async GetBuildVersionAsync(executionContext) {
        const documentTitle = await executionContext.ScriptHelper.getDocumentTitleAsync();
        if (documentTitle.includes(" ")) {
            const buildVersion = documentTitle.split(" ")[0];
            if (!(await executionContext.ScriptHelper.queryContainsAsync(buildVersion))) {
                return buildVersion;
            }
        }
        return null;
    }

    /**
     * Checks for new build event in page
     * @param {FeatureExecutionContext} executionContext execution context
     * @returns {Promise<BuildPageEvent>}
     */
    static async DetectBuildEventAsync(executionContext) {
        const checkElement = PageHelper.getElement(".bolt-header .bolt-status");
        if (checkElement.hasClass("active")) {
            const buildId = await executionContext.ScriptHelper.getQueryAsync("buildId");
            const pageEvent = new BuildPageEvent(buildId.toString());
            pageEvent.version = await Build.GetBuildVersionAsync(executionContext);
            return pageEvent;
        }
        return null;
    }

    /**
     * Checks for progress of build event in page
     * @param {FeatureExecutionContext} executionContext execution context
     * @param {BuildPageEvent} pageEvent page event
     */
    static async CheckBuildEventProgressAsync(executionContext, pageEvent) {
        const checkElement = PageHelper.getElement(".bolt-header .bolt-status");
        if (checkElement.hasClass("success")) {
            pageEvent.icon = PageEventIcon.Success;
            pageEvent.complete(BuildEventStatus.BuildSuccess);
        } else if (checkElement.hasClass("failed")) {
            pageEvent.icon = PageEventIcon.Fail;
            pageEvent.complete(BuildEventStatus.BuildFailed);
        } else if (checkElement.hasClass("warning")) {
            pageEvent.icon = PageEventIcon.Fail;
            pageEvent.complete(BuildEventStatus.BuildWarning);
        } else if (checkElement.hasClass("neutral")) {
            pageEvent.icon = PageEventIcon.Fail;
            pageEvent.complete(BuildEventStatus.BuildCanceled);
        } else {
            const taskList = PageHelper.getElement(".logs-task-list-container .bolt-status");
            const completedTaskList = taskList.filter(status => !status.hasClass("active"));
            const progress = Math.round(completedTaskList.length / taskList.length * 100);
            pageEvent.progress = progress;
            if (!pageEvent.version) {
                pageEvent.version = await Build.GetBuildVersionAsync(executionContext);
            }
        }
    }
}
