<script>
	import App from "~/App.svelte";
	import { userConfig } from "~/lib/stores";


	export let value = null;
	export let command = null;
	let active = false;
	let showing = false;

	function handleClick() {
		showing = false;
		active = true;
	}

	function handleKeyDown(e) {
		active = false;
		e.preventDefault();
		if (e.code === "Escape") return;

		if (value) {
			$userConfig.controls[value] = $userConfig.controls[value].filter(x => x !== command);
			return;
		}

		if (e.code === "Backspace") return;

		if (!$userConfig.controls[e.code]) {
			$userConfig.controls[e.code] = [];
		}
		$userConfig.controls[e.code].push(command);

		$userConfig = { ...$userConfig };
		if (!value) return;
		value = e.code;
	}

	function onOverlay(t) {
		t.focus()
		showing = true;
	}
</script>

<button class:active on:click={handleClick}>
	{value ? value : "+"}
</button>

{#if active}
<div class:showing tabindex=-1 class="overlay" on:click={() => active = false} on:keydown={handleKeyDown} use:onOverlay={this}>
	<h1>Press a key...</h1>
</div>
{/if}

<style lang="scss">
	button {
		font-size: 1.2em;
		text-transform: uppercase;
		font-weight: 700;
		&.active {
			background-color: #0f04;
			color: #0f0;
		}
	}
	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		transition: var(--menu-transition);
		background-color: #000;
		opacity: 0;
		pointer-events: none;
		&.showing {
			opacity: 0.7;
			pointer-events: auto;
		}
	}
</style>
