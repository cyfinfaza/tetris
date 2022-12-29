<script>
	import { onMount } from "svelte";
	import TetrisGame from "./core/tetris";
	import CoreGame from "./core/CoreGame.svelte";

	let linesCleared = 0;
	let dropTimestamps = [];
	let gameStartTimestamp = Infinity;
	let pps = 0;

	let game = new TetrisGame();

	let cg;

	function handleLinesCleared(e) {
		linesCleared += e.detail.numLines;
	}

	function handleDrop() {
		dropTimestamps.push(Date.now());
		pps = dropTimestamps.length / ((Date.now() - gameStartTimestamp) / 1000);
	}

	function handleRestartRequested() {
		game.resetGame();
		gameStartTimestamp = Date.now();
		dropTimestamps = [];
		pps = 0;
		linesCleared = 0;
		cg.restartGame();
		game.start();
	}

	onMount(() => {
		game.start();
		gameStartTimestamp = Date.now();
	});
</script>

<CoreGame
	{game}
	bind:this={cg}
	on:restartRequested={handleRestartRequested}
	on:drop={handleDrop}
	on:linesCleared={handleLinesCleared}
>
	<svelte:fragment slot="stats">
		<h2>{Math.round(pps * 100) / 100} PPS</h2>
		<h1>{linesCleared} {linesCleared == 1 ? "line" : "lines"}</h1>
	</svelte:fragment>
</CoreGame>
