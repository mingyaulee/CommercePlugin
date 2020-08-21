import ProjectEvents from "./project/ProjectEvents.js";
import OptionsPageFeatureProvider from "./project/OptionsPageFeatureProvider.js";

const FeatureProvider = new OptionsPageFeatureProvider();

async function initializeAsync() {
	await FeatureProvider.RunAsync(ProjectEvents.Page.PageLoaded);
}

globalThis.debugScript = () => {
	console.log("debug");
};

globalThis.document.addEventListener("DOMContentLoaded", initializeAsync);