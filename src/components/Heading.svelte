<script>
	export let name;
	export let description;
</script>

<div class="heading">
	<div>
		<h1>{name}</h1>
		{#if description}
			<p>{description}</p>
		{/if}
	</div>
</div>

<style lang="scss">
	.heading {
		width: 100%;
		display: flex;
		justify-content: center;
		text-align: center;
		padding: 8px;
		color: #fffd;
		h1 {
			font-size: 2em;
		}
		background: repeating-linear-gradient(45deg, #fff1, #fff1 1px, transparent 2px, transparent 10px);
	}
</style>
