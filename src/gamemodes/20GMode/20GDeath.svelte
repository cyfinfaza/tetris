<script>
	import { onMount } from "svelte";
	import TetrisGame from "~/core/tetris";
	import CoreGame from "~/core/CoreGame.svelte";
	import EndGameScreen from "~/components/EndGameScreen.svelte";
	import Countdown from "~/components/Countdown.svelte";
	import Timer from "~/components/Timer.svelte";
	import PpsCounter from "~/components/PPSCounter.svelte";
	import blocksbracket from "~/constants/blocks/blocksbracket";

	let level;
	let levelTarget;

	export let sectionTargetTime = 60 * 1000; // 1:00.00
	let sectionStart;
	let section;
	let regrets;

	export let torikans = [
		{ level: 500, time: 183000 }, // 500 @ 3:03.00
		{ level: 1000, time: 366000} // 1000 @ 6:06.00
	]
	let torikanBreaks;

	let gameOverMessage;
	let isGameOver;

	let garbagePoints;
	let garbageTarget;
	export let gradePrefix = "S";

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
		level = 0;

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
			game.blockSet = blocksbracket
			game.queue[4] = { ...game.queue[4], bracket: true }
		}
	}

	function handleDrop() {
		if (garbagePoints > garbageTarget && garbageTarget !== null) {
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
			cg?.displayAchievement("MISS");
		} else {
			cg?.displayAchievement("PASS");
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

	export let garbageTargetCurve = l => {
		if (l < 500)  return null;
		if (l < 600)  return 20;
		if (l < 700)  return 18;
		if (l < 800)  return 10;
		if (l < 900)  return 9;
		if (l < 1000) return 8;
		return null;
	}
	function updateGarbageTarget() {
		garbageTarget = garbageTargetCurve(level);
	}
	$: updateGarbageTarget(level);

	export let lockDelayCurve = l => {
		let LD;
		if (l < 200) return 18;
		if (l < 300) return 17;
		if (l < 400) return 15;
		if (l < 500) return 13;
		if (l < 600) return 12;
		if (l < 1100) return 10;
		if (l < 1300) return 8;
		return 18;
	}
	function updateLockDelay() {
		game.lockDelay = lockDelayCurve(level) * 1/60 * 1000
	}
	$: updateLockDelay(level);

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
	<p style="font-size: 6rem;">{gradePrefix}{section-regrets}</p>
	<p style="font-size: 2rem;">Level {Math.min(level, 1300)}</p>
	<p style="font-size: 2rem;">{finalTime}</p>
	<button on:click={handleRestartRequested}>Restart (R)</button>
</EndGameScreen>

<Countdown from={3} tickTime={500} bind:this={countdown} />
