<script>
	import { onMount } from "svelte";
	import TetrisGame, { sx, sy } from "./lib/tetris";

	let gameGridElement;

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
			if (e.key == "ArrowRight") {
				game.right();
			} else if (e.key == "ArrowLeft") {
				game.left();
			} else if (e.key == "ArrowDown") {
				game.down();
			} else if (e.key == "ArrowUp") {
				game.rotateCW();
			} else if (e.key == " ") {
				game.hardDrop();
			} else if (e.key == "Enter") {
				game.tick();
			} else if (e.key == "z") {
				game.rotateCCW();
			} else if (e.key == "r") {
				restartGame();
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
		height: 90vh;
		aspect-ratio: 10/20;
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		/* grid-template-rows: repeat(sy, 1fr); */
		background-color: #222;
		padding: 2px;
		/* gap: 2px; */
		box-sizing: border-box;
		&:focus {
			outline: none;
		}
	}
	.grid > div {
		height: 100%;
		aspect-ratio: 1;
	}
</style>
