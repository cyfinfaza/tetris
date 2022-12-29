<script>
	import { onMount, onDestroy } from "svelte";
	import blocks from "~/constants/blocks/blocks";
	import { sounds, playClearSFX, playMoveSFX, playDropSFX, playHoldSFX } from "~/lib/sounds";
	import Vis from "./Vis.svelte";
	import { createEventDispatcher } from "svelte";
	import { userConfig } from "~/lib/stores";
	import { inMenu } from "~/lib/stores";

	const dispatch = createEventDispatcher();

	export let pauseEnabled = true;

	export let game;

	let grid = game.grid;
	let queue = game.queue;
	let holdPiece = null;
	export let gameOver = false;

	let vis;

	let gravityTimeout = null;

	const measuredTimeoutLimit = 23;
	function measuredInterval(callback, dt, ...args) {
		const retValue = { timeout: null, running: true }
		let lastCall = Date.now();
		let totalMs = 0;

		function f() {
			if (!retValue.running) { return retValue; }
			const now = Date.now();
			totalMs += now - lastCall;
			lastCall = now;
			{
				let i = 0
				while (i < measuredTimeoutLimit && totalMs > dt) {
					callback();
					totalMs -= dt;
					i++;
				}
				updateVis();
			}
			retValue.timeout = setTimeout(f, dt, ...args);
			return retValue;
		}
		
		return f();
	}

	function clearMeasuredInterval(info) {
		if (info === null) { return; }
		info.running = false;
		clearTimeout(info.timeout);
	}

	function assignEventHandlersForGame(g) {
		g.onRequestGravity = (dt) => {
			if (gravityTimeout) {
				clearTimeout(gravityTimeout);
			}
			gravityTimeout = measuredInterval(() => {
				g.applyGravity();
				updateVis();
			}, 1000 / 60 / dt);
			dispatch("gravityRequested");
		};
		g.onCancelGravity = () => {
			clearMeasuredInterval(gravityTimeout);
			dispatch("gravityCancelled");
		};
		g.onGameOver = () => {
			gameOver = true;
			sounds.gameover.play();
			dispatch("gameOver");
		};
		g.onDrop = (e) => {
			if (!e.otherEventsFired) {
				playDropSFX();
			}
			dispatch("drop", e);
		};
		g.onLinesCleared = (e) => {
			playClearSFX(e.numLines);
			dispatch("linesCleared", e);
		};
		g.onPause = () => {
			dispatch("pause");
		};
		g.onResume = () => {
			dispatch("resume");
		};
	}

	$: assignEventHandlersForGame(game);
	$: if (pauseEnabled) game.running = !$inMenu;

	window.game = game;
	window.grid = grid;

	// $: console.table(grid);

	export function updateVis() {
		grid = game.grid;
		holdPiece = game.holdPiece;
		queue = game.queue;
	}

	export function restartGame() {
		clearTimeout(gravityTimeout);
		gameOver = false;
		updateVis();
		vis.shake();
		sounds.restart.play();
	}

	let dasTimeout = null;
	let arrInterval = null;
	let dasDirection = null;
	function setDasTimeout(callback) {
		callback();
		updateVis();

		clearMeasuredInterval(arrInterval);
		dasTimeout = setTimeout(() => {
			clearMeasuredInterval(arrInterval);
			arrInterval = measuredInterval(() => {
				callback();
				updateVis();
			}, $userConfig.arr);
		}, $userConfig.das)

		// function setArrTimeout() {
		// 	clearMeasuredTimeout(dasTimeout);
		// 	dasTimeout = measuredTimeout(() => {
		// 		callback();
		// 		updateVis();
		// 		setArrTimeout(callback);
		// 	}, arr);
		// }
		// callback();
		// clearMeasuredTimeout(dasTimeout);
		// dasTimeout = setTimeout(() => {
		// 	callback();
		// 	updateVis();
		// 	clearMeasuredTimeout(dasTimeout);
		// 	setArrTimeout();
		// }, das);
	}

	let downInterval = null;
	function setDownTimeout(callback) {
		const dt = 1000 / 60 / game.gravityLevel / 20 / $userConfig.sdf; // G_down = G * 20 * SDF, as per Tetris Guideline
		downInterval = measuredInterval(callback, dt);
	}

	$: if ($userConfig.consoleGame)
		console.log(
			grid.map((row) => row.map((cell) => "%c  ").join("")).join("\n"),
			...grid.reduce(
				(prev, curr) => [
					...prev,
					...curr.map(
						(cell) =>
							"background-color:" +
							(cell ? (cell.ghost ? "#333" : blocks.find((block) => block.type === cell.type).color) : "black") +
							"; border-radius: 50%; margin: 1px;"
					),
				],
				[]
			)
		);

	function handleKeyUp(e) {
		switch (e.key) {
			case "ArrowLeft":
			case "ArrowRight":
				clearMeasuredInterval(arrInterval);
				if (dasDirection === e.key) {
					clearMeasuredInterval(arrInterval);
					clearTimeout(dasTimeout);
					dasDirection = null;
				}
				break;
			case "ArrowDown":
				clearMeasuredInterval(downInterval);
				break;
		}
	}

	function handleKeyDown(e) {
		// console.log(e);
		if (e.repeat) {
			return;
		}
		if (!$inMenu) {
			switch (e.key) {
				case "ArrowRight":
					setDasTimeout(() => playMoveSFX(game.right()));
					dasDirection = e.key;
					break;
				case "ArrowLeft":
					setDasTimeout(() => playMoveSFX(game.left()));
					dasDirection = e.key;
					break;
				case "ArrowDown":
					setDownTimeout(() => playMoveSFX(game.down()));
					break;
				case "ArrowUp":
					playMoveSFX(game.rotateCW());
					break;
				case " ":
					game.hardDrop();
					break;
				case "Enter":
					game.applyGravity();
					break;
				case "a":
					playMoveSFX(game.rotateFlip());
					break;
				case "z":
					playMoveSFX(game.rotateCCW());
					break;
				case "r":
					dispatch("restartRequested");
					break;
				case "c":
					playHoldSFX(game.hold());
					break;
			}
			updateVis();
		}
	}

	onMount(() => {
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("keydown", handleKeyDown);
		updateVis();
	});
	onDestroy(() => {
		window.removeEventListener("keyup", handleKeyUp);
		window.removeEventListener("keydown", handleKeyDown);
	});
</script>

<Vis {grid} {queue} {holdPiece} {gameOver} bind:this={vis} on:restartRequested>
	<svelte:fragment slot="stats">
		<slot name="stats" />
	</svelte:fragment>
	<svelte:fragment slot="belowQueue">
		<div class="bottomRight">
			<slot name="gameName" />
		</div>
	</svelte:fragment>
</Vis>

<style>
	.bottomRight {
		display: flex;
		flex-direction: column;
		align-self: stretch;
		gap: 6px;
	}
	button {
		text-align: start;
	}
</style>
