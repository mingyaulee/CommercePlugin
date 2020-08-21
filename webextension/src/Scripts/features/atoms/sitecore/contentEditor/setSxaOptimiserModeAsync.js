import scHelper from "../scHelper.js";

export default async (mode) => {
    // set mode for Scripts
    await scHelper.contentEditor.searchItemAsync("/sitecore/system/Settings/Foundation/Experience Accelerator/Theming/Optimiser/Scripts");
    (await (await scHelper.contentEditor.getContentTabAsync()).getSectionAsync("Settings")).getField("Mode").setSelectedText(mode);
    await scHelper.contentEditor.ribbon.getTab("Home").getButton("Save").clickAsync();
    console.log("Saved Scripts");
    console.log((await (await scHelper.contentEditor.getContentTabAsync()).getSectionAsync("Settings")).getField("Mode").getSelectedText());

    // set mode for Styles
    await scHelper.contentEditor.searchItemAsync("/sitecore/system/Settings/Foundation/Experience Accelerator/Theming/Optimiser/Styles");
    (await (await scHelper.contentEditor.getContentTabAsync()).getSectionAsync("Settings")).getField("Mode").setSelectedText(mode);
    await scHelper.contentEditor.ribbon.getTab("Home").getButton("Save").clickAsync();
    console.log("Saved Styles");
    console.log((await (await scHelper.contentEditor.getContentTabAsync()).getSectionAsync("Settings")).getField("Mode").getSelectedText());
}