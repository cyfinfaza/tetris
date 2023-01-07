<script>
	export let enabled;
	export let onState = "Enabled";
	export let offState = "Disabled";
</script>

<button class:enabled on:click={() => (enabled = !enabled)}>
	{enabled ? onState : offState}
</button>

<style lang="scss">
	button {
		font-size: 1.2em;
		width: 10em;
		text-transform: uppercase;
		font-weight: 700;
		&.enabled {
			background-color: #0f04;
			color: #0f0;
		}
	}
</style>
