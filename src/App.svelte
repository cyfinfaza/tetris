<script>
	import { onMount } from "svelte";
	import TetrisGame, { sx, sy } from "./lib/tetris";
	import blocks from "./lib/blocks";
	import PieceViewer from "./components/PieceViewer.svelte";
	import { sounds, playClearSFX, playMoveSFX, playDropSFX, playHoldSFX } from "./lib/sounds";

	let gameGridElement;
	let holdPiece = null;

	let linesCleared = 0;
	let dropTimestamps = [];
	let gameStartTimestamp = Infinity;
	let pps = 0;

	let gameOver = false;

	let game = new TetrisGame();
	let grid = game.grid;
	let queue = game.queue;

	let _shake = false;

	game.onLinesCleared = (lines) => {
		linesCleared += lines;
		playClearSFX(lines);
	};
	let tickTimeout = null;
	game.onRequestTick = (dt) => {
		if (tickTimeout) {
			clearTimeout(tickTimeout);
		}
		tickTimeout = setTimeout(() => {
			game.tick();
			grid = game.grid;
		}, dt);
	};
	game.onCancelTick = () => {
		if (tickTimeout) {
			clearTimeout(tickTimeout);
		}
	};
	game.onGameOver = () => {
		gameOver = true;
		sounds.gameover.play();
	};
	game.onDrop = (e) => {
		dropTimestamps.push(Date.now());
		pps = dropTimestamps.length / ((Date.now() - gameStartTimestamp) / 1000);
		if (!e.otherEventsFired) {
			playDropSFX();
		}
	};

	window.TetrisGame = TetrisGame;
	window.game = game;
	window.grid = grid;

	// $: console.table(grid);

	function updateVis() {
		grid = game.grid;
		holdPiece = game.holdPiece;
		queue = game.queue;
	}

	function restartGame() {
		game.resetGame();
		game.start();
		gameStartTimestamp = Date.now();
		dropTimestamps = [];
		pps = 0;
		linesCleared = 0;
		gameOver = false;
		updateVis();
		_shake = false;
		setTimeout(() => {
			_shake = true;
		}, 10);
		sounds.restart.play();
	}

	const das = 140;
	const arr = 10;

	let rightState = 0;
	let leftState = 0;
	let dasTimeout = null;

	function setDasTimeout(callback) {
		function setArrTimeout() {
			clearInterval(dasTimeout);
			dasTimeout = setTimeout(() => {
				callback();
				updateVis();
				setArrTimeout(callback);
			}, arr);
		}
		callback();
		clearInterval(dasTimeout);
		dasTimeout = setTimeout(() => {
			callback();
			updateVis();
			setArrTimeout(() => {
				callback;
				updateVis();
			});
		}, das);
	}

	$: console.log(
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

	onMount(() => {
		// setInterval(() => {
		// 	game.tick();
		// 	grid = game.grid;
		// }, 1000);
		window.addEventListener("keyup", (e) => {
			switch (e.key) {
				case "ArrowLeft":
				case "ArrowRight":
				case "ArrowDown":
					clearTimeout(dasTimeout);
					dasTimeout = null;
					break;
			}
		});
		window.addEventListener("keydown", (e) => {
			// console.log(e);
			if (e.repeat) {
				return;
			}
			switch (e.key) {
				case "ArrowRight":
					setDasTimeout(() => playMoveSFX(game.right()));
					break;
				case "ArrowLeft":
					setDasTimeout(() => playMoveSFX(game.left()));
					break;
				case "ArrowDown":
					setDasTimeout(() => playMoveSFX(game.down()));
					break;
				case "ArrowUp":
					playMoveSFX(game.rotateCW());
					break;
				case " ":
					game.hardDrop();
					break;
				case "Enter":
					game.tick();
					break;
				case "a":
					playMoveSFX(game.rotateFlip());
					break;
				case "z":
					playMoveSFX(game.rotateCCW());
					break;
				case "r":
					restartGame();
					break;
				case "c":
					playHoldSFX(game.hold());
					break;
			}
			updateVis();
		});
		game.start();
		gameStartTimestamp = Date.now();
		updateVis();
	});
</script>

<main class:_shake>
	<div class="stats">
		<div>
			{#if holdPiece}
				<h2>hold</h2>
				<PieceViewer piece={holdPiece} />
			{/if}
		</div>
		<div>
			<h2>{Math.round(pps * 100) / 100} PPS</h2>
			<h1>{linesCleared} {linesCleared == 1 ? "line" : "lines"}</h1>
			{#if gameOver}
				<h2 style="color: red;">Game Over</h2>
			{/if}
			<button
				on:click={() => {
					restartGame();
					gameGridElement.focus();
				}}>Restart (R)</button
			>
		</div>
	</div>
	<div class="grid" tabindex="0" bind:this={gameGridElement}>
		{#each grid as row, i}
			{#each row as cell, j}
				<div
					class="piece"
					class:piece-active={cell && !cell?.ghost}
					class:piece-ghost={cell?.ghost}
					style:background={cell?.type ? `var(--piece-${cell.type})` : `var(--piece-empty)`}
				>
					<!-- {i},{j} -->
				</div>
			{/each}
		{/each}
	</div>
	<div class="queue">
		{#each queue as piece}
			<PieceViewer {piece} />
		{/each}
	</div>
</main>

<style lang="scss">
	main {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		> * {
			margin: 0;
		}
	}
	.grid {
		// height: 90vh;
		// aspect-ratio: 10/20;
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		/* grid-template-rows: repeat(sy, 1fr); */
		background-color: var(--board-bg);
		padding: 2px;
		/* gap: 2px; */
		box-sizing: border-box;
		&:focus {
			outline: none;
		}
	}
	.grid > div {
		height: var(--block-size);
		aspect-ratio: 1;
	}

	.queue {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		align-self: flex-start;
		gap: 12px;
		width: calc(var(--block-size) * 4);
	}

	.stats {
		align-self: stretch;
		text-align: right;
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-items: flex-end;
		justify-content: space-between;
		width: calc(var(--block-size) * 4);
		> * {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		:nth-child(2) {
			align-self: stretch;
			button {
				text-align: right;
			}
		}
	}
</style>
