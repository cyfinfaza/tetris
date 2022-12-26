<script>
	import { onMount } from "svelte";
	import TetrisGame, { sx, sy } from "./lib/tetris";
	import blocks from "./lib/blocks";
	import PieceViewer from "./components/PieceViewer.svelte";

	let gameGridElement;
	let holdPiece = null;

	let linesCleared = 0;
	let gameOver = false;

	let game = new TetrisGame();
	let grid = game.grid;
	game.onLinesCleared = (lines) => {
		linesCleared += lines;
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
	};

	window.TetrisGame = TetrisGame;
	window.game = game;
	window.grid = grid;

	// $: console.table(grid);

	function restartGame() {
		game.resetGame();
		game.start();
		linesCleared = 0;
		gameOver = false;
		grid = game.grid;
	}

	onMount(() => {
		// setInterval(() => {
		// 	game.tick();
		// 	grid = game.grid;
		// }, 1000);
		window.addEventListener("keydown", (e) => {
			// console.log(e);
			switch (e.key) {
				case "ArrowRight":
					game.right();
					break;
				case "ArrowLeft":
					game.left();
					break;
				case "ArrowDown":
					game.down();
					break;
				case "ArrowUp":
					game.rotateCW();
					break;
				case " ":
					game.hardDrop();
					break;
				case "Enter":
					game.tick();
					break;
				case "a":
					game.rotateFlip();
					break;
				case "z":
					game.rotateCCW();
					break;
				case "r":
					restartGame();
					break;
				case "c":
					game.hold();
					holdPiece = game.holdPiece;
					break;
			}
			grid = game.grid;
		});
		game.start();
		grid = game.grid;
	});
</script>

<main>
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
	<div>
		{#if holdPiece}
			<h2>hold</h2>
			<PieceViewer piece={holdPiece} />
		{/if}
		<h1>{linesCleared} lines</h1>
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
</style>
