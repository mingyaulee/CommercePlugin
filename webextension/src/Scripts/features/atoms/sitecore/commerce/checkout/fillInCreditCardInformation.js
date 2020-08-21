import helper from "../../../helper.js";

export default async () => {
    await helper.waitForConditionAsync(() => document.body.classList.contains("is-loading") === false);
    window["jQuery"]("#credit-card-number").val("4111 1111 1111 1111").trigger("change");
    const expiryYear = (new Date().getFullYear() + 1).toString().substring(2);
    window["jQuery"]("#expiration").val("11 / " + expiryYear).trigger("change");
};