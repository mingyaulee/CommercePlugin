import FeatureEvents from "./features/FeatureEvents.js";
import BackgroundScriptFeatureProvider from "./project/BackgroundScriptFeatureProvider.js";

const FeatureProvider = new BackgroundScriptFeatureProvider();

async function initializeAsync() {
    FeatureProvider.RunAsync(FeatureEvents.Background.Initialize);
}

initializeAsync();

globalThis.debugScript = () => {
    console.log("debug");
};