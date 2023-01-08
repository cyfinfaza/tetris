<script>
	import { recordState, registerStateholder } from "~/lib/replayHolder";

	registerStateholder("/components/PPSCounter", { stateFire: (s) => (state = { ...s, _disableRecord: true }) });

	let state = {
		dropTimestamps: [],
		gameStartTimestamp: Infinity,
		pps: 0,
	};

	$: {
		if (!state._disableRecord) recordState("/components/PPSCounter", state);
		delete state._disableRecord;
	}

	$: state.pps = state.dropTimestamps.length / ((Date.now() - state.gameStartTimestamp) / 1000) || 0;

	export function reset() {
		state.dropTimestamps = [];
		state.pps = 0;
		state.gameStartTimestamp = Infinity;
	}

	export function start() {
		state.gameStartTimestamp = Date.now();
	}

	export function handleDrop() {
		state.dropTimestamps = [...state.dropTimestamps, Date.now()];
	}
</script>

{Math.round(state.pps * 100) / 100}
