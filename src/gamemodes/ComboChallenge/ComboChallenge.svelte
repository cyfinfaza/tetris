<script>
	import { onMount } from "svelte";
	import { sx } from "~/core/tetris";
	import TetrisGame from "~/core/tetris";
	import CoreGame from "~/core/CoreGame.svelte";
	import EndGameScreen from "~/components/EndGameScreen.svelte";
	import Countdown from "~/components/Countdown.svelte";
	import Timer from "~/components/Timer.svelte";
	import PpsCounter from "~/components/PPSCounter.svelte";
	import comboMap from "~/maps/4wide.js";

	let currentCombo = 0;
	let maxCombo = 0;

	let game = new TetrisGame();

	let countdown;
	let timer;
	let ppscounter;

	let showingEndGame = false;

	let gameRunning = false;

	let cg;

	function handleLinesCleared(e) {
		const clearedLines = e.detail.numLines;
		// console.log(clearedLines);
		for (let y = 0; y < clearedLines; y++) {
			for (let x = 0; x < sx; x++) {
				if (2 < x && x < 7) {
					continue;
				}
				// console.log(x, y);
				game.staticMatrix[y][x] = { type: "clearable-garbage" };
			}
		}
		cg.updateVis();
	}

	function handleDrop() {
		ppscounter.handleDrop();
		currentCombo = game.currentCombo;
		if (currentCombo > maxCombo) {
			maxCombo = currentCombo;
		}
	}

	function handleTimeLimit() {
		game.triggerGameComplete();
		showingEndGame = true;
		gameRunning = false;
	}

	function handleGameOver() {
		timer.pause();
		handleTimeLimit();
	}

	function clearGame() {
		gameRunning = false;
		game.resetGame();
		showingEndGame = false;
		cg.restartGame();
		ppscounter.reset();
		timer.reset();
		currentCombo = 0;
		maxCombo = 0;
	}

	function startGame() {
		gameRunning = true;
		ppscounter.start();
		game.gameOver = false;
		timer.start();
		game.start();
	}

	function handleRestartRequested() {
		clearGame();
		game.staticMatrix = comboMap;
		cg.updateVis();

		countdown.start(() => {
			startGame();
		});
	}

	onMount(() => {
		game.staticMatrix = comboMap;
		cg.updateVis();
		countdown.start(() => {
			startGame();
		});
	});
</script>

<CoreGame
	{game}
	pauseEnabled={false}
	bind:this={cg}
	on:restartRequested={handleRestartRequested}
	on:drop={handleDrop}
	on:linesCleared={handleLinesCleared}
	on:gameOver={handleGameOver}
	blurGame={showingEndGame}
	inputDisabled={!gameRunning}
>
	<svelte:fragment slot="stats">
		<h2><PpsCounter bind:this={ppscounter} /> PPS</h2>
		<h2><Timer timerLimit={1000 * 60 * 2} bind:this={timer} on:limitReached={handleTimeLimit} /></h2>
		<h1>{currentCombo}/{maxCombo}</h1>
	</svelte:fragment>
	<h1 slot="gameName">Combo Challenge</h1>
</CoreGame>

<EndGameScreen {showingEndGame}>
	<h1>GAME COMPLETE!</h1>
	<p style="font-size: 4em;">{maxCombo}</p>
	<button on:click={handleRestartRequested}>Restart (R)</button>
</EndGameScreen>

<Countdown from={3} tickTime={500} bind:this={countdown} />
