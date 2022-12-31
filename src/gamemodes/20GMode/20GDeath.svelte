<script>
	import { onMount } from "svelte";
	import TetrisGame from "~/core/tetris";
	import CoreGame from "~/core/CoreGame.svelte";
	import EndGameScreen from "~/components/EndGameScreen.svelte";
	import Countdown from "~/components/Countdown.svelte";
	import Timer from "~/components/Timer.svelte";
	import PpsCounter from "~/components/PPSCounter.svelte";

	let level = 0;
	let levelTarget = 99;

	let game = new TetrisGame();

	let countdown;
	let timer;
	let ppscounter;

	let showingEndGame = false;

	let gameRunning = false;

	let finalTime = 0;

	let cg;

	function handleLinesCleared(e) {
		const { numLines } = e.detail;
		level += [0, 1, 2, 4, 6][numLines];
		updateLevelTarget();
		updateLockDelay();
		if (level >= 1300) {
			game.triggerGameComplete();
			showingEndGame = true;
			finalTime = timer.pause().timerString;
			gameRunning = false;
		}
	}

	function handleSpawn(e) {
		if (level % 100 != 99) {
			level += 1;
		}
	}

	function handleDrop() {
		ppscounter.handleDrop();
	}

	function updateLevelTarget() {
		levelTarget = (level / 100 | 0) * 100 + 99;
	}

	function clearGame() {
		gameRunning = false;
		game.resetGame();
		showingEndGame = false;
		cg.restartGame();
		ppscounter.reset();
		timer.reset();
	}

	function startGame() {
		game.gravityLevel = 20;
		updateLockDelay();

		gameRunning = true;
		ppscounter.start();
		game.gameOver = false;
		timer.start();
		game.start();
	}

	function handleRestartRequested() {
		clearGame();
		level = 0;
		updateLevelTarget();

		countdown.start(() => {
			startGame();
		});
	}

	function updateLockDelay() {
		let LD;
		if (level < 200) LD = 18;
		else if (level < 300) LD = 18;
		else if (level < 400) LD = 15;
		else if (level < 500) LD = 13;
		else if (level < 600) LD = 12;
		else if (level < 1100) LD = 10;
		else if (level < 1300) LD = 8;
		game.lockDelay = LD * 1/60 * 1000; // ms = F * 1/60 F/s * 1000 ms/s
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
	on:gameOver={timer.pause}
	on:spawnBlock={handleSpawn}
	blurGame={showingEndGame}
	inputDisabled={!gameRunning}
>
	<svelte:fragment slot="stats">
		<h2><PpsCounter bind:this={ppscounter} /> PPS</h2>
		<h2><Timer bind:this={timer} /></h2>
		<h1>{level}/{levelTarget}</h1>
	</svelte:fragment>
	<h1 slot="gameName">20G Mode</h1>
</CoreGame>

<EndGameScreen {showingEndGame}>
	<h1>GAME COMPLETE!</h1>
	<p style="font-size: 4rem;">{finalTime}</p>
	<button on:click={handleRestartRequested}>Restart (R)</button>
</EndGameScreen>

<Countdown from={3} tickTime={500} bind:this={countdown} />
