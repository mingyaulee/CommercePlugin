import helper from "../../../helper.js";

export default async () => {
    const component = document.querySelector(".cxa-checkoutdelivery-component");
    if (component) {
        const data = window["ko"].dataFor(component);
        data.selectedShippingOption(1);

        data.shippingAddress().name("Testing Customer");
        data.shippingAddress().city("California");
        data.shippingAddress().country("US");
        data.shippingAddress().state("CA");
        data.shippingAddress().address1("123 Queen Street");
        data.shippingAddress().zipPostalCode("2022");

        if (data.shippingMethods().length === 0) {
            data.getShippingMethods();
            await helper.waitForConditionAsync(() => data.shippingMethods().length > 0);
        }
        data.shippingMethod(data.shippingMethods()[0]);
    }
};