import BaseScriptHelper from "../../foundation/helpers/BaseScriptHelper.js";
import Atom from "../../foundation/modules/Atom.js";
import AutomationTask from "../../foundation/modules/AutomationTask.js";

export const AutomationTypeId = "CommerceAutomations";
const AutomationTypeName = "Sitecore Commerce";

/**
 * Checks whether the page is Commerce page
 * @param {Object} context context object
 * @param {BaseScriptHelper} context.ScriptHelper script helper
 * @param {Object} context.Options options
 * @returns {Promise<Boolean>}
 */
export function IsCommercePageAsync(context) {
    return context.ScriptHelper.executeScriptAsync(`window.hasOwnProperty("CXAApplication")`);
}

/**
 * Checks whether the page is Checkout Delivery page
 * @param {Object} context context object
 * @param {BaseScriptHelper} context.ScriptHelper script helper
 * @param {Object} context.Options options
 * @returns {Promise<Boolean>}
 */
export function IsDeliveryPageAsync(context) {
    return Atom.ExecuteAsync(context.ScriptHelper, context.Options, "locationContains", "/checkout/delivery", "pathname");
}

/**
 * Checks whether the page is Checkout Billing page
 * @param {Object} context context object
 * @param {BaseScriptHelper} context.ScriptHelper script helper
 * @param {Object} context.Options options
 * @returns {Promise<Boolean>}
 */
export function IsBillingPageAsync(context) {
    return Atom.ExecuteAsync(context.ScriptHelper, context.Options, "locationContains", "/checkout/billing", "pathname");
}

export const FillInDeliveryInformation = new AutomationTask(`${AutomationTypeId}.FillInDeliveryInformation`)
    .withType(AutomationTypeName)
    .withName("Fill in delivery information")
    .withSelector("body")
    .withExecuteFunction(async context => {
        await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "waitForAjax");
        await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "sitecore/commerce/checkout/fillInDeliveryInformation");
        context.End(true);
    });

export const FillInBillingInformation = new AutomationTask(`${AutomationTypeId}.FillInBillingInformation`)
    .withType(AutomationTypeName)
    .withName("Fill in billing information")
    .withSelector("body")
    .withExecuteFunction(async context => {
        await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "waitForAjax");
        await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "sitecore/commerce/checkout/fillInBillingInformation");

        await context.ScriptHelper.waitForConditionAsync(`document.getElementById("braintree-dropin-frame") !== null`);
        context.Info("Filling in credit card information");
        await Atom.ExecuteInFrameAsync("#braintree-dropin-frame", context.ScriptHelper, context.Options, "sitecore/commerce/checkout/fillInCreditCardInformation");

        context.Info("Clicking validating payment button");
        await context.ScriptHelper.executeScriptAsync(`
            jQuery(".validate-payment-btn").trigger("click");
        `);

        context.End(true);
    });

export const PerformCheckout = new AutomationTask(`${AutomationTypeId}.PerformCheckout`)
    .withType(AutomationTypeName)
    .withName("Checkout cart")
    .withSelector(".cxa-minicart-component")
    .withExecuteFunction(async context => {
        context.Info("Redirecting to checkout delivery URL");
        await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "sitecore/commerce/goToUrl", "/checkout/delivery");
        await context.ScriptHelper.waitForDocumentLoaded();

        await context.ExecuteSubtaskAsync(FillInDeliveryInformation, false);
        context.Info("Clicking continue button");
        await context.ScriptHelper.executeScriptAsync(`
            jQuery(".btn-delivery-next").trigger("click");
        `);
        await context.ScriptHelper.waitForDocumentLoaded();

        await context.ExecuteSubtaskAsync(FillInBillingInformation, false);
        context.Info("Clicking continue button");
        await context.ScriptHelper.executeScriptAsync(`
            jQuery(".to-confirm-button").trigger("click");
        `);
        await context.ScriptHelper.waitForDocumentLoaded();
        await Atom.ExecuteAsync(context.ScriptHelper, context.Options, "waitForAjax");

        await context.ScriptHelper.waitForConditionAsync(`jQuery(".confirm-next-button").is(":disabled") === false`, { delayMs: 1000 });
        context.Info("Clicking confirm button");
        await context.ScriptHelper.executeScriptAsync(`
            jQuery(".confirm-next-button").trigger("click");
        `);

        context.End(true);
    });