import scHelper from "../scHelper.js";

export default async () => {
    const publishMenu = await scHelper.contentEditor.ribbon.getTab("Publish").getButton("Publish").expandAsync();
    console.log("Expanded publish menu", publishMenu, publishMenu.containerElement);
    const publishButton = publishMenu.getButton("Publish site");
    console.log("Get publish button", publishButton, publishButton.buttonElement);
    await publishButton.clickAsync();
    await scHelper.waitForAjaxAsync();
    await scHelper.waitForPopupAsync();
}