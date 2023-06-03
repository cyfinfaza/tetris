<script>
    import { setContext, getContext } from "svelte";
	import { ReplayHolder } from "~/lib/replayHolder";

	const replayHolder = new ReplayHolder();
	setContext('replayHolder', replayHolder);

    // $: replayHolder.$inReplay = gameView === "replay";
    replayHolder.$inReplay = false;

    export let gameComponent;
    export let gameProps;
</script>

<svelte:component this={gameComponent} {...gameProps} />