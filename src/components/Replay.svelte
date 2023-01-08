<script>
	import GameModes from "~/gamemodes/index-singleplayer";
	export let replayFile;
	let replayData = null;
	let gameComponent;
	$: if (replayFile) {
		replayData = JSON.parse(replayFile);
	}
	$: if (replayData) {
		gameComponent = GameModes[replayData.meta.gamemode].component;
	}
</script>

{#if gameComponent}
	<svelte:component this={gameComponent} {...GameModes[replayData.meta.gamemode].props} replay />
{/if}
