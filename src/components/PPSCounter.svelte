<script>
	import { getContext } from "svelte";
	import EventManager from "~/lib/eventManager";

	const eventManager = new EventManager("/components/PPSCounter", {
		initialState: {
			dropTimestamps: [],
			gameStartTimestamp: Infinity,
			pps: 0,
		},
		events: {}
	});

	const state = eventManager.state;

	const { now } = getContext('replayHolder');

	$: $state.pps = $state.dropTimestamps.length / ((now() - $state.gameStartTimestamp) / 1000) || 0;

	export function reset() {
		$state.dropTimestamps = [];
		$state.pps = 0;
		$state.gameStartTimestamp = Infinity;
	}

	export function start() {
		$state.gameStartTimestamp = now();
	}

	export function handleDrop() {
		$state.dropTimestamps = [...$state.dropTimestamps, now()];
	}
</script>

{Math.round($state.pps * 100) / 100}
