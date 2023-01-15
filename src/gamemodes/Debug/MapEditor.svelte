<script>
	import { onMount } from "svelte";
	import TetrisGame, { ry } from "~/core/tetris";
	import CoreGame from "~/core/CoreGame.svelte";
	import blockTypes from "~/constants/blocks/1x1.js";
	import Setting from "~/components/Setting.svelte";
	import { binding_callbacks } from "svelte/internal";

	let game = new TetrisGame({queueLength: 0});
	let pieceElements;
	
	let cg;
	
	let selectedType = {};
	let requireClear = true;
	let pieceQueueString = "";
	let saveToValue;

	function draw(x, y, piece) {
		game.staticMatrix[y + ry][x] = piece;
		cg.updateVis();
	}

	function addListeners() {
		pieceElements.forEach((elements, y) => {
			elements.forEach((element, x) => {
				function handleMouse(e) {
					if (e.buttons & 1) {
						draw(x, y, selectedType);
					}
					if (e.buttons & 2) {
						draw(x, y, null);
					}
				}
				if (element === null) {
					return;
				}
				element.addEventListener("contextmenu", (e) => {
					e.preventDefault();
				});
				element.addEventListener("mousedown", handleMouse);
				element.addEventListener("mouseover", handleMouse);
			});
		});
	}

	function selectPieceType(type) {
		selectedType = {...type, requireClear};
	}

	$: {
		pieceQueueString = pieceQueueString.toUpperCase();
	}

	$: {
		switch(saveToValue) {
			case 'Local File':
				break;
			case 'Cloud':
				break;
			case 'Clipboard':
				navigator.clipboard.writeText(JSON.stringify(game.staticMatrix));
				break;
		}
		saveToValue = null;
	}

	function copyMap() {
		'Local File', 'Cloud', 'Clipboard'
	}

	onMount(() => {
		addListeners();
	});

</script>

<CoreGame
	{game}
	bind:this={cg}
	bind:pieceElements
	sidePane="settings"
	gravityEnabled={false}
	inputDisabled={true}
>
<div class="sideSettings" slot="sidePane">
	<Setting name="Select" type="custom">
		{#each blockTypes as type}
			<button 
				class="palette"
				style:background={`var(--piece-${type?.bracket ? "bracket" : type.type})`}
				on:click={() => {selectPieceType(type)}}
			/>
		{/each}
	</Setting>
	<Setting name="Require Clear" bind:value={requireClear} type="toggle"/>
	<Setting name="Piece Queue" bind:value={pieceQueueString} type="text"/>
	<Setting name="Preview Mode" bind:value={pieceQueueString} type="toggle"/>
	<Setting name="" type="custom"><button class="copy" on:click={copyMap}>Copy Map to Clipboard</button></Setting>
	<Setting name="Save to" type="dropdown" bind:value={saveToValue} options={['Local File', 'Cloud', 'Clipboard']}/>
</div>
</CoreGame>

<style>
button.palette {
	height: var(--block-size);
	aspect-ratio: 1;
}
</style>