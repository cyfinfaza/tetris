<script>
	import { createEventDispatcher } from "svelte";
	import PieceViewer from "./PieceViewer.svelte";

	export let grid = game.grid;
	export let queue = game.queue;
	export let holdPiece = null;
	export let gameOver = false;

	let _shake = false;

	export function shake() {
		_shake = false;
		setTimeout(() => {
			_shake = true;
		}, 10);
	}

	let gameGridElement;

	const dispatch = createEventDispatcher();
</script>

<div class="vis" class:_shake>
	<div class="stats">
		<div>
			{#if holdPiece}
				<h2>hold</h2>
				<PieceViewer piece={holdPiece} />
			{/if}
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
</div>

<style lang="scss">
	.vis {
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
