<script>
	import { createEventDispatcher } from "svelte/internal";
	import { onDestroy } from "svelte";

	export let from;
	export let tickTime = 1000;

	const dispatch = createEventDispatcher();

	let showing = false;
	let currentCount = from;

	let interval = null;

	export function start(callback) {
		clearInterval(interval);
		showing = true;
		currentCount = from;
		interval = setInterval(() => {
			console.log(currentCount);
			currentCount--;
			if (currentCount <= 0) {
				clearInterval(interval);
				showing = false;
				callback();
				dispatch("go");
			}
		}, tickTime);
	}

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="countdown" class:showing>
	<p style="font-size: 4rem;">{currentCount}</p>
</div>

<style lang="scss">
	.countdown {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 12px;
		transition: var(--menu-transition);
		&:not(.showing) {
			opacity: 0;
			transform: scale(0.5);
			pointer-events: none;
		}
	}
</style>
