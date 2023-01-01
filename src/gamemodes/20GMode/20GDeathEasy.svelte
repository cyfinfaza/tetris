<script>
	import { onMount } from "svelte";
	import TetrisGame from "~/core/tetris";
	import CoreGame from "~/core/CoreGame.svelte";
	import EndGameScreen from "~/components/EndGameScreen.svelte";
	import Countdown from "~/components/Countdown.svelte";
	import Timer from "~/components/Timer.svelte";
	import PpsCounter from "~/components/PPSCounter.svelte";
	import defaultBlocks from "~/constants/blocks/blocks";

	let level;
	let levelTarget;

	const sectionTargetTime = 60 * 1000; // 1:00.00
	let sectionStart;
	let section;
	let regrets;

	const torikans = [
		{ level: 500, time: 284000 }, // 500 @ 4:44.00
		{ level: 1000, time: 568000} // 1000 @ 9:28.00
	]
	let torikanBreaks;

	let gameOverMessage;
	let isGameOver;

	let garbagePoints;
	let garbageTarget;

	let game = new TetrisGame();

	let countdown;
	let timer;
	let timerValue;
	let ppscounter;

	let showingEndGame = false;

	let gameRunning = false;

	let finalTime = 0;

	let cg;

	function initialState() {
		level = 700;

		sectionStart = null;
		section = 0;
		regrets = 0;
		garbagePoints = 0;

		torikanBreaks = new Array(torikans.length).fill(false);
	}

	function handleLinesCleared(e) {
		const { numLines } = e.detail;
		level += [0, 1, 2, 4, 6][numLines];
		garbagePoints = Math.max(garbagePoints - numLines, 0);

		if (level >= 1300) {
			gameOverMessage = "GAME COMPLETE!";
			isGameOver = false;
			endGameSequence();
		}
	}

	function endGameSequence() {
			game.triggerGameComplete();
			showingEndGame = true;
			finalTime = timer.pause().timerString;
			gameRunning = false;
	}

	function handleSpawn(e) {
		if (level % 100 != 99) {
			level += 1;
		}
		if (garbageTarget !== null) {
			garbagePoints++;
		}
		if (level >= 1000) {
			game.queue[4] = { ...game.queue[4], bracket: true }
		}
	}

	function handleDrop() {
		if (garbagePoints > garbageTarget) {
			garbagePoints = 0;
			cg.cloneGarbage();
		}
		ppscounter.handleDrop();
	}

	$: levelTarget = (level / 100 | 0) * 100 + 99;
	$: section = level / 100 | 0;

	function updateSectionTime() {
		if (Date.now() - sectionStart > sectionTargetTime && sectionStart !== null) {
			regrets++;
		}
		sectionStart = Date.now();
	}
	$: { // Update every section change
		section;
		updateSectionTime();
	}

	function checkTorikans() {
		torikans.forEach((torikan, i) => {
			if (level >= torikan.level && !torikanBreaks[i]) {
				if (timerValue > torikan.time) {
					gameOverMessage = "Too Slow!";
					isGameOver = true;
					endGameSequence();
				} else {
					torikanBreaks[i] = true;
				}
			}
		});
	}
	$: {
		level;
		checkTorikans();
	}

	$: {
		if (level < 500)  garbageTarget = null;
		else if (level < 600)  garbageTarget = 25;
		else if (level < 700)  garbageTarget = 18;
		else if (level < 800)  garbageTarget = 12;
		else if (level < 900)  garbageTarget = 9;
		else if (level < 1000) garbageTarget = 8;
		else garbageTarget = null;
	}

	$: {
		let LD;
		if (level < 200) LD = 45;
		else if (level < 300) LD = 40;
		else if (level < 400) LD = 35;
		else if (level < 500) LD = 30;
		else if (level < 600) LD = 25;
		else if (level < 1100) LD = 23;
		else if (level < 1300) LD = 20;
		game.lockDelay = LD * 1/60 * 1000; // ms = F * 1/60 F/s * 1000 ms/s
	}

	function clearGame() {
		initialState();
		gameRunning = false;
		game.resetGame();
		showingEndGame = false;
		cg.restartGame();
		ppscounter.reset();
		timer.reset();
	}

	function startGame() {
		game.gravityLevel = 20;
		// updateLockDelay();

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

	function handleGameOver() {
		timer.pause();
		gameOverMessage = "Top Out!";
		isGameOver = true;
		endGameSequence();
	}

	onMount(() => {
		initialState();
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
	on:spawnBlock={handleSpawn}
	blurGame={showingEndGame}
	inputDisabled={!gameRunning}
	gravityEnabled={gameRunning}
>
	<svelte:fragment slot="stats">
		<h2><PpsCounter bind:this={ppscounter} /> PPS</h2>
		<h2><Timer bind:this={timer} bind:timerValue={timerValue}/></h2>
		<h1>{level}/{levelTarget}</h1>
	</svelte:fragment>
	<h1 slot="gameName">20G Death</h1>
</CoreGame>

<EndGameScreen {showingEndGame}>
	<h1 style="{ isGameOver ? 'color: red;' : '' }">{gameOverMessage}</h1>
	<p style="font-size: 6rem;">S{section-regrets}</p>
	<p style="font-size: 2rem;">Level {Math.min(level, 1300)}</p>
	<p style="font-size: 2rem;">{finalTime}</p>
	<button on:click={handleRestartRequested}>Restart (R)</button>
</EndGameScreen>

<Countdown from={3} tickTime={500} bind:this={countdown} />
