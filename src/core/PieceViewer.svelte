<script>
	export let piece;
</script>

{#if piece}
	<div class="piece-viewer" style:grid-template-columns={`repeat(${piece.shape[0].length}, 1fr)`}>
		{#each piece.shape as row}
			{#each row as cell}
				<div
					class="piece"
					class:piece-active={cell}
					style:background={cell ? `var(--piece-${piece.type})` : `var(--piece-empty)`}
				/>
			{/each}
		{/each}
	</div>
{/if}

<style lang="scss">
	.piece-viewer {
		display: inline-grid;
		background-color: var(--board-bg);
		> .piece {
			height: var(--block-size);
			aspect-ratio: 1;
		}
	}
</style>
