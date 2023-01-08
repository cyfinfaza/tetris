<script>
	import CaptureKey from "./CaptureKey.svelte";
	import { userConfig } from "~/lib/stores";

	export let name;
	export let description = "";
	export let command = null;
</script>

<div class="setting">
	<div>
		<h2>{name}</h2>
		{#if description}
			<p>{description}</p>
		{/if}
	</div>
	<div class="input">
		{#each Object.keys($userConfig.controls) as key}
			{#if $userConfig.controls[key].indexOf(command) >= 0 }
				<CaptureKey value={key} bind:command />
			{/if}
		{/each}
		<CaptureKey bind:command />
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
			font-size: 2rem;
		}
		.input {
			font-size: 1.2rem;
			font-weight: 700;
			flex-shrink: 0;
		}
	}
</style>
