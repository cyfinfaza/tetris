<script>
	import { onMount } from "svelte";
	import TetrisGame from "~/core/tetris";
	import CoreGame from "~/core/CoreGame.svelte";
	import EndGameScreen from "~/components/EndGameScreen.svelte";
	import Countdown from "~/components/Countdown.svelte";
	import Timer from "~/components/Timer.svelte";
	import PpsCounter from "~/components/PPSCounter.svelte";

	let linesCleared = 0;

	let game = new TetrisGame();

	let countdown;
	let timer;
	let ppscounter;

	let showingEndGame = false;

	let gameRunning = false;

	let finalTime = 0;

	let cg;

	function handleLinesCleared(e) {
		linesCleared += e.detail.numLines;
		if (linesCleared >= 40) {
			game.triggerGameComplete();
			showingEndGame = true;
			finalTime = timer.pause().timerString;
			gameRunning = false;
		}
	}

	function handleDrop() {
		ppscounter.handleDrop();
	}

	function clearGame() {
		gameRunning = false;
		game.resetGame();
		linesCleared = 0;
		showingEndGame = false;
		cg.restartGame();
		ppscounter.reset();
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

		countdown.start(() => {
			startGame();
		});
	}

	onMount(() => {
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
	blurGame={showingEndGame}
	inputDisabled={!gameRunning}
>
	<svelte:fragment slot="stats">
		<h2><PpsCounter bind:this={ppscounter} /> PPS</h2>
		<h2><Timer bind:this={timer} /></h2>
		<!-- <h1>{linesCleared - 40} {Math.abs(linesCleared - 40) == 1 ? "line" : "lines"}</h1> -->
		<h1>{linesCleared}/40</h1>
	</svelte:fragment>
	<h1 slot="gameName">40L</h1>
</CoreGame>

<EndGameScreen {showingEndGame}>
	<h1>GAME COMPLETE!</h1>
	<p style="font-size: 4rem;">{finalTime}</p>
	<button on:click={handleRestartRequested}>Restart (R)</button>
</EndGameScreen>

<Countdown from={3} tickTime={500} bind:this={countdown} />
