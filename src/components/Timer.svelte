<script>
	import { createEventDispatcher } from "svelte";
	let pausedTime = 0;

	let startingTimestamp = null;
	export let running = false;
	export let timerValue = 0;
	export let timerString = "0:00.00";
	export let timerLimit = null;

	const dispatch = createEventDispatcher();

	export function reset() {
		startingTimestamp = null;
		timerValue = 0;
		timerString = "0:00.00";
		pausedTime = 0;
		running = false;
	}

	export function start() {
		startingTimestamp = Date.now();
		timerValue = 0;
		pausedTime = 0;
		running = true;
		updateTimer();
	}

	export function pause() {
		running = false;
		pausedTime += Date.now() - startingTimestamp;
		startingTimestamp = null;
		return { value: pausedTime, timerString };
	}

	export function resume() {
		running = true;
		startingTimestamp = Date.now();
		updateTimer();
	}

	function updateTimerString() {
		let s = ((((timerValue / 1000) % 60) * 100) | 0) / 100;
		const m = (timerValue / 60000) % 60 | 0;
		const h = (timerValue / 3600000) | 0;

		s = `${s}`;
		if (s < 10) {
			s = `0${s}`;
		}
		s = s.padEnd(3, ".");
		s = s.padEnd(5, "0");
		if (h < 1) {
			timerString = `${m}:${s}`;
		} else {
			timerString = `${h}:${m}:${s}`;
		}
	}

	export function updateTimer() {
		if (running) {
			timerValue = Date.now() - startingTimestamp + pausedTime;
		} else {
			timerValue = pausedTime;
		}
		if (timerLimit !== null) {
			timerValue = timerLimit - timerValue;
		}

		if (timerLimit !== null && timerValue < 0) {
			pause();
			timerValue = timerLimit;
			dispatch("limitReached");
		}
		updateTimerString();

		dispatch("update");

		if (running) {
			requestAnimationFrame(updateTimer);
		}
	}
</script>

{timerString}
