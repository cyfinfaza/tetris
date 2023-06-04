<script>
	import { onMount, onDestroy, setContext } from "svelte";
	import GameModes from "~/gamemodes/index-singleplayer";
	export let replayFile;
	let replayData = null;
	let gameComponent;
	import { generalSoundDisable } from "~/lib/sounds";
	import { ReplayHolder } from "~/lib/replayHolder";

	const replayHolder = new ReplayHolder();
	setContext('replayHolder', replayHolder);

    // $: replayHolder.$inReplay = gameView === "replay";
    replayHolder.inReplay.set(true);

	const {
		goToIndex,
		importReplayTimeline,
		populateStatesGen,
		step,
		getFrameTimestamp,
		overrideNowOffset,
		numStates
	} = replayHolder;

	let running = false;
	let startTimestamp = null;

	$: overrideNowOffset(startTimestamp);

	let loaded = false;
	let populationProgress = 0;

	let slider;

	$: if (replayFile) {
		replayData = JSON.parse(replayFile);
	}
	$: if (replayData) {
		gameComponent = GameModes[replayData.meta.gamemode].component;
	}

	function play() {
		startTimestamp = Date.now() - getFrameTimestamp(0);
		console.log(startTimestamp, getFrameTimestamp(0));
		running = true;
	}

	function pause() {
		running = false;
	}

	function tick() {
		if (running) {
			const relativeTime = Date.now() - startTimestamp;
			// console.log(atIndex, getNextFrameTimestamp());
			while (getFrameTimestamp(1) < relativeTime) {
				const success = step();
				if (!success) {
					running = false;
					break;
				}
				slider.value = replayHolder.atIndex;
			}
		}
		requestAnimationFrame(tick);
	}

	function handleInput(e) {
		switch (e.key) {
			case "ArrowLeft":
				e.preventDefault();
				goToIndex(replayHolder.atIndex - 1);
				break;
			case "ArrowRight":
				e.preventDefault();
				goToIndex(replayHolder.atIndex + 1);
				break;
			case " ":
				if (running) {
					pause();
				} else {
					play();
				}
				break;
			case "Home":
				goToIndex(0);
				break;
			case "End":
				goToIndex($numStates - 1);
				break;
		}
		slider.value = replayHolder.atIndex;
	}

	onMount(async () => {
		if (replayData) {
			importReplayTimeline(replayData);
			// console.log("loaded");
		}
		$generalSoundDisable = true;
		for await (const progress of populateStatesGen()) {
			console.log('something');
			populationProgress = progress;
		}
		$generalSoundDisable = false;
		loaded = true;
		// console.log("populated");
		startTimestamp = Date.now();
		goToIndex(0);
		slider.value = 0;
		requestAnimationFrame(tick);
		play();
		window.addEventListener("keydown", handleInput);
	});

	onDestroy(() => {
		window.removeEventListener("keydown", handleInput);
	});
</script>

<div class="replayContainer" class:loaded>
	{#if gameComponent}
		<svelte:component this={gameComponent} {...GameModes[replayData.meta.gamemode].props} replay />
	{/if}
</div>

<div class="overlay" class:loaded>
	<div class="progress">
		<p>Building timeline...</p>
		<progress value={populationProgress * 100} max="100" />
		<p>{Math.round(populationProgress * 100)} %</p>
	</div>
	<div class="controls">
		<button
			on:click={() => {
				if (running) {
					pause();
				} else {
					play();
				}
			}}><span class="material-symbols-rounded">{running ? "pause" : "play_arrow"}</span></button
		>
		<input
			type="range"
			class="slider"
			min="0"
			max={$numStates}
			on:input={(e) => {
				// running = false;
				goToIndex(parseInt(e.target.value));
				console.log(replayHolder.atIndex);
				startTimestamp = Date.now() - getFrameTimestamp(0);
			}}
			bind:this={slider}
		/>
	</div>
</div>

<style lang="scss">
	.replayContainer {
		position: absolute;
		inset: 0;
		--game-height: 84vh;
		&:not(.loaded) {
			filter: brightness(0.5) grayscale(0.5);
		}
	}
	.overlay {
		position: absolute;
		inset: 0;
		border: 1px solid #f30c;
		box-shadow: inset 0 0 7em 0 #f304;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		.progress {
			transition: var(--menu-transition);
		}
		&.loaded {
			.progress {
				opacity: 0;
				transform: scale(0.5);
				pointer-events: none;
			}
		}
		&:not(.loaded) {
			.controls {
				pointer-events: none;
				filter: contrast(0.5);
			}
		}
		.controls {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			// height: 3em;
			padding: 2vh;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: var(--pad);
			--item-height: 4vh;
			padding-inline: 4em;
			transition: 120ms;
			opacity: 0.5;
			&:hover {
				opacity: 1;
			}
		}
		button {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			height: var(--item-height);
			// aspect-ratio: 1;
		}
		.slider {
			-webkit-appearance: none;
			appearance: none;
			background: #fff2;
			padding: 0;
			height: var(--item-height);
			position: relative;
			flex: 1;
			&::-webkit-slider-thumb {
				-webkit-appearance: none;
				appearance: none;
				height: var(--item-height);
				width: 1em;
				background: #f30c;
				cursor: pointer;
			}
			&::-moz-range-thumb {
				height: var(--item-height);
				width: 1em;
				background: #f30c;
				cursor: pointer;
			}
		}
	}
</style>
