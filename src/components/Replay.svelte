<script>
	import { onMount, onDestroy } from "svelte";
	import GameModes from "~/gamemodes/index-singleplayer";
	import { goToIndex, importReplayTimeline, step } from "~/lib/replayHolder";
	export let replayFile;
	let replayData = null;
	let gameComponent;
	
	let running = true;
	let startTimestamp = null;
	let offset = 0;
	let idx = 0;
	
	let cg;
	
	$: if (replayFile) {
		replayData = JSON.parse(replayFile);
		importReplayTimeline(replayData);
		console.log('loaded');
	}
	$: if (replayData) {
		gameComponent = GameModes[replayData.meta.gamemode].component;
	}

	function tick() {
		const refTimestamp = replayData.timeline[0].timestamp;
		const relativeTime = Date.now() - startTimestamp;
		
		while (replayData.timeline[idx].timestamp - refTimestamp < relativeTime) {
			idx++;
			step();
			// fireEventAtIndex(idx);
		}
		
		if (running) requestAnimationFrame(tick);
	}
	
	onMount(() => {
		startTimestamp = Date.now();
		goToIndex(0);
		requestAnimationFrame(tick);
	});

	// onDestroy = () => {

	// }
</script>

{#if gameComponent}
	<svelte:component this={gameComponent} {...GameModes[replayData.meta.gamemode].props} replay />
{/if}
