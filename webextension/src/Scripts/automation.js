import AutomationPageFeatureProvider from "./project/AutomationPageFeatureProvider.js";
import ProjectEvents from "./project/ProjectEvents.js";

const FeatureProvider = new AutomationPageFeatureProvider();

async function initializeAsync() {
	await FeatureProvider.RunAsync(ProjectEvents.Page.Initialize);
	await FeatureProvider.RunAsync(ProjectEvents.Page.PageLoaded);
}

globalThis.debugScript = () => {
    console.log("debug");
};

globalThis.document.addEventListener("DOMContentLoaded", initializeAsync);