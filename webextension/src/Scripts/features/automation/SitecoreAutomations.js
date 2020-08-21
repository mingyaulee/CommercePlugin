import BaseScriptHelper from "../../foundation/helpers/BaseScriptHelper.js";
import StringHelper from "../../foundation/helpers/StringHelper.js";
import Atom from "../../foundation/modules/Atom.js";
import AutomationTask from "../../foundation/modules/AutomationTask.js";

export const AutomationTypeId = "SitecoreAutomations";
const AutomationTypeName = "Sitecore";
const SxaAutomationTypeName = "Sitecore SXA";

/**
 * Checks whether the page is Sitecore Identity Server login page
 * @param {Object} context context object
 * @param {BaseScriptHelper} context.ScriptHelper script helper
 * @param {Object} context.Options options
 * @returns {Promise<Boolean>}
 */
export async function IsLoggedInAsync(context) {
    return await IsSitecoreApplicationPageAsync(context) || await IsExperienceEditorPageAsync(context);
}

/**
 * Checks whether the page is Sitecore Identity Server login page
 * @param {Object} context context object
 * @param {BaseScriptHelper} context.ScriptHelper script helper
 * @param {Object} context.Options options
 * @returns {Promise<Boolean>}
 */
export function IsIdentityServerPageAsync(context) {
    return Atom.ExecuteAsync(context.ScriptHelper, context.Options, "sitecore/isIdentityServerPage");
}

/**
 * Checks whether the page is Sitecore application page
 * @param {Object} context context object
 * @param {BaseScriptHelper} context.ScriptHelper script helper
 * @param {Object} context.Options options
 * @returns {Promise<Boolean>}
 */
export function IsSitecoreApplicationPageAsync(context) {
    return Atom.ExecuteAsync(context.ScriptHelper, context.Options, "locationContains", "/sitecore/", "pathname");
}

/**
 * Checks whether the page is an Azure instance
 * @param {Object} context context object
 * @param {BaseScriptHelper} context.ScriptHelper script helper
 * @param {Object} context.Options options
 * @returns {Promise<Boolean>}
 */
export function IsAzureInstanceAsync(context) {
    return Atom.ExecuteAsync(context.ScriptHelper, context.Options, "locationContains", ".azurewebsites.net", "host");
}

/**
 * Checks whether the page is Sitecore Content Editor page
 * @param {Object} context context object
 * @param {BaseScriptHelper} context.ScriptHelper script helper
 * @param {Object} context.Options options
 * @returns {Promise<Boolean>}
 */
export function IsContentEditorPageAsync(context) {
    return Atom.ExecuteAsync(context.ScriptHelper, context.Options, "locationContains", "/sitecore/shell/applications/content%20editor.aspx", "pathname");
}

/**
 * Checks whether the page is Sitecore Content Editor page
 * @param {Object} context context object
 * @param {BaseScriptHelper} context.ScriptHelper script helper
 * @param {Object} context.Options options
 * @returns {Promise<Boolean>}
 */
export function IsExperienceEditorPageAsync(context) {
    return context.ScriptHelper.executeScriptAsync(`window.hasOwnProperty("ExperienceEditor")`);
}

/**
 * Automation for logging in to Sitecore
 */
export const LoginToSitecoreTask = new AutomationTask(`${AutomationTypeId}.LoginToSitecoreTask`)
    .withType(AutomationTypeName)
    .withName("Login to Sitecore")
    .withSelector("body > .main-wrap > .main > .login-page .form-group:nth-child(2)")
    .withExecuteFunction(async context => {
        if (!await IsIdentityServerPageAsync(context)) {
            const host = await context.ScriptHelper.getUrlHostAsync();
            const sitecoreUrl = StringHelper.formatTemplate(context.Options.Automations.Sitecore.LoginUrl, { host: host });
            context.Info("Redirecting to login: " + sitecoreUrl);
            await context.ScriptHelper.redirectToAsync(sitecoreUrl);
            if (!await IsIdentityServerPageAsync(context)) {
                if (await IsSitecoreApplicationPageAsync(context)) {
                    context.Info("You are logged in already");
                    context.End(true);
                } else {
                    context.Error("Unable to load identity server login page");
                    context.End(false);
                }
                return;
            }
        }

        let username = context.Options.Automations.Sitecore.LoginCredential.OnPrem.Username;
        let password = context.Options.Automations.Sitecore.LoginCredential.OnPrem.Password;
        if (await IsAzureInstanceAsync(context)) {
            username = context.Options.Automations.Sitecore.LoginCredential.Azure.Username;
            password = context.Options.Automations.Sitecore.LoginCredential.Azure.Password;
        }

        const success = await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "sitecore/sitecoreIdentityServerLogin", username, password);

        await context.ScriptHelper.waitForDocumentLoaded();

        if (success) {
            context.Success("Completed");
        } else {
            context.Error("Failed to execute login script");
        }

        context.End(true);
    });

export const LaunchInViewModeTask = new AutomationTask(`${AutomationTypeId}.LaunchInViewModeTask`)
    .withType(AutomationTypeName)
    .withName("Launch in View Mode")
    .withSelector("body")
    .withExecuteFunction(async context => {
        const url = await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "sitecore/getSitecoreInstanceHostName");
        if (url && url.indexOf("http") === 0) {
            context.Info("Redirecting to " + url);
            await context.ScriptHelper.redirectToAsync(url + "?sc_lang=en&sc_mode=normal&sc_debug=0&sc_trace=0&sc_prof=0&sc_ri=0&sc_rb=0&sc_expview=0");
            context.End(true);
        } else {
            context.Error("Unable to get the site URL");
            context.End(false);
        }
    });

export const LaunchContentEditorTask = new AutomationTask(`${AutomationTypeId}.LaunchContentEditorTask`)
    .withType(AutomationTypeName)
    .withName("Launch Content Editor")
    .withExecuteFunction(async context => {
        if (await IsContentEditorPageAsync(context)) {
            context.Info("Content Editor is already loaded");
            context.End(true);
            return;
        }

        await context.ExecuteSubtaskAsync(LoginToSitecoreTask, true);
        const host = await context.ScriptHelper.getUrlHostAsync();
        const contentEditorUrl = StringHelper.formatTemplate(context.Options.Automations.Sitecore.ContentEditorUrl, { host: host });
        await context.ScriptHelper.redirectToAsync(contentEditorUrl);
        context.End(true);
    });

export const SwitchOffResourceOptimiserTask = new AutomationTask(`${AutomationTypeId}.SwitchOffResourceOptimiserTask`)
    .withType(SxaAutomationTypeName)
    .withName("Switch off scripts and styles optimiser")
    .withExecuteFunction(async context => {
        await context.ExecuteSubtaskAsync(LaunchContentEditorTask, true);
        await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "sitecore/contentEditor/setSxaOptimiserModeAsync", "Disabled");
        await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "sitecore/contentEditor/openPublishSiteDialogAsync");

        const publishFrameUrl = "/sitecore/shell/Applications/Publish.aspx";
        if (await context.ScriptHelper.checkFrameExistAsync(publishFrameUrl)) {
            await Atom.ExecuteInFrameAsync(publishFrameUrl, context.ScriptHelper, context.Options, "sitecore/publishDialog/clickPublishSite", { incrementalPublish: true });
        } else {
            context.Error("Failed to open the publish popup");
        }
        context.End(true);
    });

export const DebugTask = new AutomationTask(`${AutomationTypeId}.DebugTask`)
    .withType("Test")
    .withName("Debug")
    .withExecuteFunction(async context => {
        await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "sitecore/scDebug");
        context.End(true);
    });