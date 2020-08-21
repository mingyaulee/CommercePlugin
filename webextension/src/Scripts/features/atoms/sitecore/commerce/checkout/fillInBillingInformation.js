export default async () => {
    const component = document.querySelector(".cxa-checkoutbilling-component");
    if (component) {
        const data = window["ko"].dataFor(component);
        data.billingEmail("test@test.com");
        data.billingConfirmEmail("test@test.com");

        if (window["jQuery"](".apply-credit-card-toggle").is(".ccpayment.open") === false) {
            window["jQuery"](".apply-credit-card-toggle").trigger("click");
        }
        data.selectedBillingAddress("UseShipping");
    }
};