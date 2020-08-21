import ProjectEvents from "./project/ProjectEvents.js";
import ContentScriptFeatureProvider from "./project/ContentScriptFeatureProvider.js";

const FeatureProvider = new ContentScriptFeatureProvider();

function isDocumentReady() {
	return globalThis.document.readyState === "complete";
}

export async function initializeAsync() {
	if (!isDocumentReady()) {
		globalThis.window.addEventListener("load", initializeAsync);
	} else {
		await FeatureProvider.RunAsync(ProjectEvents.Page.Initialize);
		await FeatureProvider.RunAsync(ProjectEvents.Page.PageLoaded);
	}
}

globalThis.debugScript = () => {
    console.log("debug");
};