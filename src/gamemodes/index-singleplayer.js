import BasicGamemode from "./basic/BasicGamemode.svelte";
import fortyL from "./40L/40L.svelte";
import debugGamemode from "./Debug/DebugGamemode.svelte";

export default {
	basic: {
		title: "Zen",
		description: "The original game mode.",
		component: BasicGamemode,
	},
	fortyL: {
		title: "40L",
		description: "Clear 40 lines as fast as possible.",
		component: fortyL,
	},
	debug: {
		title: "Debug",
		description: "Testy Testy",
		component: debugGamemode,
	},
};
