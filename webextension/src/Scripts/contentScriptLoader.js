(async () => {
	// @ts-ignore
	await import("./lib/browser-polyfill.min.js");
	const contentScript = await import("./contentScript.js");
	contentScript.initializeAsync();
	globalThis.ContentScript = contentScript;
})();