<script>
	import { createEventDispatcher } from "svelte";
	import { inMenu } from "~/lib/stores";
	import PieceViewer from "./PieceViewer.svelte";
	import { sx, sy, ry } from "./tetris";
	import { userConfig } from "~/lib/stores";

	export let grid = game.grid;
	export let queue = game.queue;
	export let holdPiece = null;
	export let gameOver = false;

	export let disabled = false;

	let _shake = false;

	export function shake() {
		_shake = false;
		setTimeout(() => {
			_shake = true;
		}, 10);
	}

	let gameGridElement;

	const dispatch = createEventDispatcher();

	export let pieceElements = new Array(sy).fill(null).map(() => new Array(sx).fill(null));
</script>

<div class="vis" class:showGridLines={$userConfig.showGridLines} class:disabled class:_shake>
	<div class="stats">
		<div>
			{#if holdPiece}
				<h2>hold</h2>
				<PieceViewer piece={holdPiece} />
			{/if}
		</div>
		<div>
			<slot name="belowHold" />
		</div>
		<div>
			<slot name="stats" />
			{#if gameOver}
				<h2 style="color: red;">Game Over</h2>
			{/if}
			<button
				on:click={() => {
					dispatch("restartRequested");
					gameGridElement.focus();
				}}>Restart (R)</button
			>
			<button on:click={() => ($inMenu = true)}>Menu (ESC)</button>
		</div>
	</div>
	<div class="grid" tabindex="-1" bind:this={gameGridElement}>
		{#each grid as row, i}
			{#each row as cell, j}
				<div
					class="piece"
					bind:this={pieceElements[i][j]}
					class:piece-active={cell && !cell?.ghost}
					class:piece-ghost={cell?.ghost}
					style:background={cell?.type ? `var(--piece-${cell.type})` : null}
				>
					<!-- {i}<br />{j} -->
				</div>
			{/each}
		{/each}
	</div>
	<div class="right">
		<div class="queue">
			{#each queue as piece}
				<PieceViewer {piece} />
			{/each}
		</div>
		<slot name="belowQueue" />
	</div>
	<div class="sidePane">
		<slot name="sidePane" />
	</div>
</div>

<style lang="scss">
	.vis {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		transition: 0.2s;
		// width: 100%;
		// height: 100%;
		> * {
			margin: 0;
		}
		&.disabled {
			filter: blur(24px) grayscale(0.4);
			transform: scale(0.8);
			opacity: 0.5;
			pointer-events: none;
		}
	}
	.grid {
		// height: 90vh;
		// aspect-ratio: 10/20;
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		/* grid-template-rows: repeat(sy, 1fr); */
		background-color: var(--board-bg);
		/* gap: 2px; */
		box-sizing: border-box;
		&:focus {
			outline: none;
		}
		.showGridLines > & {
			background-color: #fff4;
			gap: 1px;
			padding: 1px;
		}
		> div {
			height: var(--block-size);
			aspect-ratio: 1;
			.showGridLines > & {
				background: #222;
			}
		}
	}

	.right {
		width: calc(var(--block-size) * 4);
		align-self: stretch;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.queue {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		align-self: flex-start;
		gap: 12px;
		width: 100%;
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

	.sidePane {
		align-self: stretch;
	}
</style>
