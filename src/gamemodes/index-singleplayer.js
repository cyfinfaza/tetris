import ZenGamemode from "./zen/ZenGamemode.svelte";
import sprint from "./sprint/sprint.svelte";
import debugGamemode from "./Debug/DebugGamemode.svelte";
import comboChallenge from "./ComboChallenge/ComboChallenge.svelte";
import instaGravDeath from "./20GMode/20GDeath.svelte";
import instaGravDeathEasy from "./20GMode/20GDeathEasy.svelte";
import { userConfig } from "~/lib/stores";
import { get } from "svelte/store";

export default {
	zen: {
		title: "Zen",
		description: "Practice stacking, try out new openers, or whatever you please",
		component: ZenGamemode,
	},
	fortyL: {
		title: "40L",
		description: "Clear 40 lines as fast as possible",
		component: sprint,
		props: { linesToClear: 40 },
	},
	twentyL: {
		title: "20L",
		description: "Clear 20 lines as fast as possible",
		component: sprint,
		props: { linesToClear: 20 },
	},
	fiveL: {
		title: "5L",
		description: "Clear 5 lines as fast as possible",
		component: sprint,
		props: { linesToClear: 5 },
	},
	comboChallenge: {
		title: "Combo Challenge",
		description: "Get the highest combo you can in 2 minutes",
		component: comboChallenge,
	},
	instaGrav: {
		title: "20G Death",
		description: "The blocks fall instantly, but it doesn't stop there. Can you hold out for 1300 levels?",
		component: instaGravDeath,
	},
	instaGravEasy: {
		title: "20G Death (Easy)",
		description: "A slower and more forgiving variant of 20G Death.",
		component: instaGravDeathEasy,
	},
	debug: {
		title: "Debug",
		description: "Testy Testy",
		component: debugGamemode,
		get hidden() { return !get(userConfig).debugEnabled },
	},
};
