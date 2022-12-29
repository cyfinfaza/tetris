<script>
	import { onMount, onDestroy } from "svelte";
	import blocks from "../constants/blocks/blocks";
	import { sounds, playClearSFX, playMoveSFX, playDropSFX, playHoldSFX } from "../lib/sounds";
	import Vis from "./Vis.svelte";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let game;

	let grid = game.grid;
	let queue = game.queue;
	let holdPiece = null;
	export let gameOver = false;

	let vis;

	let gravityTimeout = null;

	function assignEventHandlersForGame(g) {
		g.onRequestGravity = (dt) => {
			if (gravityTimeout) {
				clearTimeout(gravityTimeout);
			}
			gravityTimeout = setTimeout(() => {
				g.applyGravity();
				updateVis();
			}, 1000 / 60 / dt);
			dispatch("gravityRequested");
		};
		g.onCancelGravity = () => {
			if (gravityTimeout) {
				clearTimeout(gravityTimeout);
			}
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
	}

	$: assignEventHandlersForGame(game);

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

	const das = 140; // Delayed Auto Shift	
	const arr = 10;  // Automatic Repeat Rate
	const sdf = 1;   // Soft Drop Factor
	let dasTimeout = null;
	let dasDirection = null;
	function setDasTimeout(callback) {
		function setArrTimeout() {
			clearTimeout(dasTimeout);
			dasTimeout = setTimeout(() => {
				callback();
				updateVis();
				setArrTimeout(callback);
			}, arr);
		}
		callback();
		clearTimeout(dasTimeout);
		dasTimeout = setTimeout(() => {
			callback();
			updateVis();
			setArrTimeout(() => {
				callback;
				updateVis();
			});
		}, das);
	}

	let downTimeout = null;
	function setDownTimeout(callback) {
		callback();
		updateVis();
		downTimeout = setTimeout(setDownTimeout, sdf * game.gravityLevel * 20, callback);
	}

	// $: console.log(
	// 	grid.map((row) => row.map((cell) => "%c  ").join("")).join("\n"),
	// 	...grid.reduce(
	// 		(prev, curr) => [
	// 			...prev,
	// 			...curr.map(
	// 				(cell) =>
	// 					"background-color:" +
	// 					(cell ? (cell.ghost ? "#333" : blocks.find((block) => block.type === cell.type).color) : "black") +
	// 					"; border-radius: 50%; margin: 1px;"
	// 			),
	// 		],
	// 		[]
	// 	)
	// );

	function handleKeyUp(e) {
		switch (e.key) {
			case "ArrowLeft":
			case "ArrowRight":
				if (dasDirection === e.key) {
					clearTimeout(dasTimeout, e.key);
					dasTimeout = null;
					dasDirection = null;
				}
				break;
			case "ArrowDown":
				clearTimeout(downTimeout);
				downTimeout = null;
				break;
		}
	}

	function handleKeyDown(e) {
		// console.log(e);
		if (e.repeat) {
			return;
		}
		switch (e.key) {
			case "ArrowRight":
				setDasTimeout(() => playMoveSFX(game.right()));
				dasDirection = e.key
				break;
			case "ArrowLeft":
				setDasTimeout(() => playMoveSFX(game.left()));
				dasDirection = e.key
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
</Vis>
