<script>
	export let showingEndGame;
</script>

<div class="endgame" class:showingEndGame>
	<slot />
</div>

<style lang="scss">
	.endgame {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--pad);
		transition: var(--menu-transition);
		&:not(.showingEndGame) {
			opacity: 0;
			transform: translateY(60px);
			pointer-events: none;
		}
	}
</style>
