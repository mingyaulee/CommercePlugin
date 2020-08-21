import FeatureEvents from "./features/FeatureEvents.js";
import PopupPageFeatureProvider from "./project/PopupPageFeatureProvider.js";
import ProjectEvents from "./project/ProjectEvents.js";

const FeatureProvider = new PopupPageFeatureProvider();

async function initializeAsync() {
	await FeatureProvider.RunAsync(FeatureEvents.Background.Initialize);
	await FeatureProvider.RunAsync(ProjectEvents.Page.PageLoaded);
}

globalThis.debugScript = () => {
    console.log("debug");
};

globalThis.document.addEventListener("DOMContentLoaded", initializeAsync);