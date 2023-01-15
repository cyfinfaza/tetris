<script>
	import { createEventDispatcher } from "svelte";
	import { inMenu, inReplay } from "~/lib/stores";
	import PieceViewer from "./PieceViewer.svelte";
	import { sx, sy, ry } from "./tetris";
	import { userConfig } from "~/lib/stores";
	import { onMount } from "svelte";

	export let grid = game.grid;
	export let queue = game.queue;
	export let holdPiece = null;
	export let gameOver = false;
	export let sidePane = null;

	export let disabled = false;

	export let settingsOpen = true;

	$: if ($inReplay) settingsOpen = false;

	let _shake = false;

	export function shake() {
		_shake = false;
		setTimeout(() => {
			_shake = true;
		}, 10);
	}

	export function focus() {
		gameGridElement.focus();
	}

	let gameGridElement;

	const dispatch = createEventDispatcher();

	export let pieceElements = new Array(sy).fill(null).map(() => new Array(sx).fill(null));

	onMount(() => {
		window.addEventListener("keydown", (e) => {
			if (e.key === "tab") {
			}
		});
	});
</script>

<div
	class="vis"
	class:hasSidePane={sidePane !== null}
	class:showGridLines={$userConfig.showGridLines}
	class:disabled
	class:_shake
	class:settingsOpen
>
	<div class="board">
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
						style:background={cell?.type
							? `var(--piece-${cell?.ghost ? "ghost" : cell?.bracket ? "bracket" : cell.type})`
							: null}
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
	</div>
	{#if sidePane !== null}
		<div class="sidePane" on:focusin={() => (settingsOpen = true)}>
			<!-- <div> -->
			<button on:click={() => (settingsOpen = !settingsOpen)}
				><span>{(settingsOpen ? "Collapse " : "") + sidePane}</span></button
			>
			<div class="sidePaneContent">
				<slot name="sidePane" />
			</div>
			<!-- </div> -->
		</div>
	{/if}
</div>

<style lang="scss">
	.vis {
		width: 100%;
		height: 100%;
		--block-size: calc(var(--game-height) / 20);
		align-items: center;
		justify-items: center;
		display: grid;
		gap: var(--pad);
		--settings-width: 35em;
		--settings-button-width: 2em;
		--settings-combined-width: calc(var(--settings-width) + var(--settings-button-width));
		transition: var(--menu-transition);
		&.disabled {
			filter: blur(24px) grayscale(0.4);
			transform: scale(0.8);
			opacity: 0.5;
			pointer-events: none;
		}
		&.hasSidePane {
			grid-template-columns: 1fr 0;
			&.settingsOpen {
				grid-template-columns: 1fr var(--settings-combined-width);
			}
		}
	}
	.board {
		height: var(--game-height);
		padding: 5vh;
		box-sizing: content-box;
		display: flex;
		align-items: flex-end;
		gap: var(--pad);
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
		z-index: 5;
	}

	.queue {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		align-self: flex-start;
		gap: var(--pad);
		width: 100%;
	}

	.stats {
		align-self: stretch;
		text-align: right;
		display: flex;
		flex-direction: column;
		gap: var(--pad);
		align-items: flex-end;
		justify-content: space-between;
		width: calc(var(--block-size) * 4);
		> * {
			display: flex;
			flex-direction: column;
			gap: var(--pad);
		}
		:nth-child(2) {
			align-self: stretch;
			button {
				text-align: right;
			}
		}
		z-index: 5;
	}

	.sidePane {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 15;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-self: stretch;
		background: #2228;
		backdrop-filter: blur(6px) grayscale(0.4);
		display: grid;
		max-width: 100vw;
		grid-template-columns: auto 0;
		transition: var(--menu-transition);
		.settingsOpen & {
			grid-template-columns: auto var(--settings-width);
		}
		overflow: hidden;
		button {
			rotate: 180deg;
			> span {
				writing-mode: vertical-rl;
				text-transform: capitalize;
			}
		}
		.sidePaneContent {
			display: flex;
			width: 0;
			width: var(--settings-width);
			flex-direction: column;
			gap: var(--pad);
			padding: var(--pad);
			overflow-y: auto;
			overflow-x: hidden;
		}
	}
</style>
