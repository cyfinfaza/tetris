<script>
	import ToggleButton from "./ToggleButton.svelte";

	export let name;
	export let description;
	export let value = null;
	export let type;
	export let unit = null;
</script>

<div class="setting">
	<div>
		<h2>{name}</h2>
		{#if description}
			<p>{description}</p>
		{/if}
	</div>
	<div class="input">
		{#if type === "number"}
			<input type="number" bind:value />
			{#if unit}
				<span>{unit}</span>
			{/if}
		{:else if type === "text"}
			<input type="text" bind:value />
		{:else if type === "toggle"}
			<ToggleButton bind:enabled={value} />
		{/if}
	</div>
</div>

<style lang="scss">
	.setting {
		width: 100%;
		border-bottom: solid 4px #fff4;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding-bottom: 8px;
		gap: 12px;
		h2 {
			font-size: 2em;
		}
		.input {
			font-size: 1.2em;
			font-weight: 700;
			flex-shrink: 0;
			input[type="number"] {
				width: 10em;
				text-align: end;
				font: inherit;
			}
		}
	}
</style>
