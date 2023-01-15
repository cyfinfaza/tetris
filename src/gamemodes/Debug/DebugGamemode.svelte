<script>
	import { onMount } from "svelte";
	import TetrisGame, { ry } from "~/core/tetris";
	import CoreGame from "~/core/CoreGame.svelte";
	import PpsCounter from "~/components/PPSCounter.svelte";
	import Setting from "~/components/Setting.svelte";
	import { numStates, goToIndex, recordEvent, registerStateholder, recordState } from "~/lib/replayHolder";

	let state = {
		linesCleared: 0,
		gravityEnabled: true,
		inputEnabled: true,
	};
	registerStateholder("/gamemodes/DebugGamemode", { stateFire: (s) => (state = { ...s, _disableRecord: true }) });

	$: {
		if (!state._disableRecord) recordState("/gamemodes/DebugGamemode", state);
		delete state._disableRecord;
	}

	const events = {
		drawPiece: (x, y, piece) => {
			game.staticMatrix[y + ry][x] = piece;
			cg.updateVis();
		},
	};

	function fireEvent(name, records = true, ...args) {
		if (records) recordEvent("/gamemodes/DebugGamemode", name, args);
		events[name](...args);
	}

	let ppscounter;

	let pieceElements;
	window.pieceElements = pieceElements;

	let game = new TetrisGame();

	let cg;

	function handleLinesCleared(e) {
		state.linesCleared += e.detail.numLines;
	}

	function handleDrop() {
		ppscounter.handleDrop();
	}

	function handleRestartRequested() {
		game.resetGame();
		state.linesCleared = 0;
		cg.restartGame();
		ppscounter.reset();
		game.start();
		ppscounter.start();
	}

	function addDebugListeners() {
		pieceElements.forEach((elements, y) => {
			elements.forEach((element, x) => {
				function handleMouse(e) {
					if (e.buttons & 1) {
						fireEvent("drawPiece", true, x, y, { type: "clearable-garbage" });
					}
					if (e.buttons & 2) {
						fireEvent("drawPiece", true, x, y, null);
					}
				}
				if (element === null) {
					return;
				}
				element.addEventListener("contextmenu", (e) => {
					e.preventDefault();
				});
				element.addEventListener("mousedown", handleMouse);
				element.addEventListener("mouseover", handleMouse);
			});
		});
	}

	$: game.lockDelay = state.gravityEnabled ? 30 : Infinity;

	onMount(() => {
		game.start();
		ppscounter.start();
		addDebugListeners();
	});

	// $: console.log($numStates);
</script>

<CoreGame
	{game}
	bind:this={cg}
	bind:pieceElements
	on:restartRequested={handleRestartRequested}
	on:drop={handleDrop}
	on:linesCleared={handleLinesCleared}
	inputDisabled={!state.inputEnabled}
	sidePane="settings"
	blurGame={state.showingEndGame}
	gravityEnabled={state.gravityEnabled}
>
	<svelte:fragment slot="stats">
		<h2><PpsCounter bind:this={ppscounter} /> PPS</h2>
		<h1>{state.linesCleared} {state.linesCleared == 1 ? "line" : "lines"}</h1>
	</svelte:fragment>
	<h1 slot="gameName">Debug Mode</h1>
	<svelte:fragment slot="sidePane">
		<Setting name="Input" bind:value={state.inputEnabled} type="toggle" />
		<Setting name="Gravity" bind:value={state.gravityEnabled} type="toggle" />
		<input
			type="range"
			style="width: 100%"
			min="0"
			max={$numStates - 1}
			value={$numStates}
			on:input={(e) => goToIndex(e.target.value)}
		/>
	</svelte:fragment>
</CoreGame>
