<script>
	import { onMount } from "svelte";
	import TetrisGame from "~/core/tetris";
	import CoreGame from "~/core/CoreGame.svelte";
	import PpsCounter from "~/components/PPSCounter.svelte";

	let linesCleared = 0;
	let dropTimestamps = [];
	let gameStartTimestamp = Infinity;
	let ppscounter;

	let showingEndGame = false;

	let pieceElements;
	window.pieceElements = pieceElements;

	let game = new TetrisGame();

	let cg;

	function handleLinesCleared(e) {
		linesCleared += e.detail.numLines;
	}

	function handleDrop() {
		ppscounter.handleDrop();
	}

	function handleRestartRequested() {
		game.resetGame();
		linesCleared = 0;
		cg.restartGame();
		ppscounter.reset();
		game.start();
		ppscounter.start();
	}

	function addDebugListeners() {
		console.log(pieceElements);
		pieceElements.forEach((elements, y) => {
			elements.forEach((element, x) => {
				element.addEventListener("click", () => {
					game.staticMatrix[y][x] = { type: "clearable-garbage" };
					cg.updateVis();
				});
			});
		});
	}

	onMount(() => {
		game.start();
		ppscounter.start();
		addDebugListeners();
		gameStartTimestamp = Date.now();
	});
</script>

<CoreGame
	{game}
	bind:this={cg}
	bind:pieceElements
	on:restartRequested={handleRestartRequested}
	on:drop={handleDrop}
	on:linesCleared={handleLinesCleared}
	blurGame={showingEndGame}
>
	<svelte:fragment slot="stats">
		<h2><PpsCounter bind:this={ppscounter} /> PPS</h2>
		<h1>{linesCleared} {linesCleared == 1 ? "line" : "lines"}</h1>
	</svelte:fragment>
	<h1 slot="gameName">Debug Mode</h1>
</CoreGame>
