<script>
	let dropTimestamps = [];
	let gameStartTimestamp = Infinity;

	let pps = 0;
	$: pps = dropTimestamps.length / ((Date.now() - gameStartTimestamp) / 1000) || 0;

	export function reset() {
		dropTimestamps = [];
		pps = 0;
		gameStartTimestamp = Infinity;
	}

	export function start() {
		gameStartTimestamp = Date.now();
	}

	export function handleDrop() {
		dropTimestamps = [...dropTimestamps, Date.now()];
	}
</script>

{Math.round(pps * 100) / 100}
