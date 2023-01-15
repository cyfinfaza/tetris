<script>
	export let options;
	export let selected = null;
	export let placeholder = "Select";

	let active = false;

	function clickSelect() {
		active = !active;
	}

	function blurSelect(e) {
		if (e.currentTarget.contains(e.relatedTarget)) {
			return;
		}
		active = false;
	}

	function clickOption(idx) {
		selected = options[idx];
	}
</script>

<div on:focusout={blurSelect} class="wrapper">
	<button on:click={clickSelect} class="select" >
		<input placeholder={placeholder} value={selected?.name ?? selected ?? placeholder}/>
	</button>
	<div class="option-wrapper">
		{#each options as option, i}
			<button on:click={() => {clickOption(i)}} class="option" class:active value={option.value ?? option.name ?? option}>{option.name ?? option}</button>
		{/each}
	</div>
</div>

<style>
	input {
		pointer-events: none;
		background-color: transparent;
	}
	.wrapper {
		position: relative;
	}
	.option-wrapper {
		width: 100%;
		height: 80%;
		position: absolute;
	}
	.placeholder {
		color: #fff2;
		position: relative;
	}
	button.option {
		opacity: 0;
		display: block;
		position: relative;
		width: 100%;
		transition: all 250ms cubic-bezier(0.075, 0.82, 0.165, 1);
		height: 0;
	}
	button.option.active {
		opacity: 1;
		height: 100%;
	}
</style>