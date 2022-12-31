<script>
	import { onMount } from "svelte";
	import TetrisGame, { ry } from "~/core/tetris";
	import CoreGame from "~/core/CoreGame.svelte";
	import PpsCounter from "~/components/PPSCounter.svelte";
	import Setting from "~/components/Setting.svelte";

	let linesCleared = 0;
	let dropTimestamps = [];
	let gameStartTimestamp = Infinity;
	let ppscounter;

	let gravityEnabled = true;

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

	function draw(x, y, piece) {
		game.staticMatrix[y+ry][x] = piece;
		cg.updateVis();
	}

	function addDebugListeners() {
		pieceElements.forEach((elements, y) => {
			elements.forEach((element, x) => {
				function handleMouse(e) {
					if (e.buttons & 1) {
						draw(x, y, { type: "clearable-garbage" });
					}
					if (e.buttons & 2) {
						draw(x, y, null);
					}
				}
				if (element === null) { return; }
				element.addEventListener("contextmenu", (e) => {
					e.preventDefault();
				});
				element.addEventListener("mousedown", handleMouse);
				element.addEventListener("mouseover", handleMouse);
			});
		});
	}

	$: game.lockDelay = gravityEnabled ? 500 : Infinity;

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
	{gravityEnabled}
>
	<svelte:fragment slot="stats">
		<h2><PpsCounter bind:this={ppscounter} /> PPS</h2>
		<h1>{linesCleared} {linesCleared == 1 ? "line" : "lines"}</h1>
	</svelte:fragment>
	<h1 slot="gameName">Debug Mode</h1>
	<div class="sideSettings" slot="sidePane">
		<Setting name="Gravity" bind:value={gravityEnabled} type="toggle" />
	</div>
</CoreGame>

<style>
	.sideSettings {
		/* flex: 1; */
		width: 400px;
	}
</style>
