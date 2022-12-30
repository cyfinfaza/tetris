import { writable } from "svelte/store";
import { defaultUserConfig } from "./config";

function getLocalConfig() {
	const config = localStorage.getItem("userConfig");
	if (config) {
		return { defaultUserConfig, ...JSON.parse(config) };
	}
	return defaultUserConfig;
}
export const userConfig = writable(getLocalConfig());
userConfig.subscribe((value) => {
	localStorage.setItem("userConfig", JSON.stringify(value));
});

export const inMenu = writable(true);

export const windowInFocus = writable(true);
document.addEventListener("visibilitychange", () => {
	windowInFocus.set(!document.hidden);
});
