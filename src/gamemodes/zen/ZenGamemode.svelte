<script>
	import { onMount } from "svelte";
	import TetrisGame from "~/core/tetris";
	import CoreGame from "~/core/CoreGame.svelte";
	import PpsCounter from "~/components/PPSCounter.svelte";
	import EventManager from "~/lib/eventManager";

	let linesCleared = 0;

	let game = new TetrisGame();

	let cg;
	let ppscounter;

	function handleLinesCleared(e) {
		linesCleared += e.detail.numLines;
	}

	function handleDrop() {
		ppscounter.handleDrop();
	}

	const eventManager = new EventManager("/gamemodes/Zen", {
		events: {
			handleRestartRequested,
		}
	});

	function handleRestartRequested() {
		game.resetGame();
		linesCleared = 0;
		ppscounter.reset();
		ppscounter.start();
		cg.restartGame();
		game.start();
	}

	onMount(() => {
		cg.start();
		ppscounter.start();
	});
</script>

<CoreGame
	{game}
	bind:this={cg}
	on:restartRequested={()=>eventManager.fireStateRecordingEvent("handleRestartRequested")}
	on:drop={handleDrop}
	on:linesCleared={handleLinesCleared}
>
	<svelte:fragment slot="stats">
		<h2><PpsCounter bind:this={ppscounter} /> PPS</h2>
		<h1>{linesCleared} {linesCleared == 1 ? "line" : "lines"}</h1>
	</svelte:fragment>
	<h1 slot="gameName">ZEN</h1>
</CoreGame>
