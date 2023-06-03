<script>
	import GameModes from "~/gamemodes/index-singleplayer";
	import { getContext, onMount, setContext } from "svelte";
	import Setting from "./components/Setting.svelte";
	import KeybindSetting from "./components/KeybindSetting.svelte";
	import Heading from "./components/Heading.svelte";
	import { userConfig } from "./lib/stores";

	import { inMenu } from "./lib/stores";
	import Replay from "./components/Replay.svelte";
	import { ReplayHolder } from "./lib/replayHolder";

	const replayHolder = new ReplayHolder();
	
	let gameView = "game";
	$: $replayHolder.inReplay = gameView === "replay";
	
	setContext('replayHolder', replayHolder);

	const menus = [
		{ id: "play", name: "Play" },
		{ id: "replays", name: "Replays" },
		{ id: "settings", name: "Settings" },
	];
	let currentMenu = "play";

	let gameComponent;
	const gameModeIds = Object.keys(GameModes);
	let currentGameMode = null;

	$: if (currentGameMode !== null) {
		gameComponent = GameModes[currentGameMode].component;
	}

	let replayFile = null;

	onMount(() => {
		// gameComponent = GameModes["basic"].component;
		window.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				// console.log(!currentGameMode || !$inMenu);
				if (currentGameMode || gameView == "replay") $inMenu = !$inMenu;
			}
		});
	});
</script>

{#if gameView === "game"}
	<div class="game" class:inMenu={$inMenu}>
		{#if gameComponent}
			{#key currentGameMode}
				<svelte:component this={gameComponent} {...GameModes[currentGameMode].props} />
			{/key}
		{/if}
	</div>
{:else if gameView === "replay"}
	<div class="game" class:inMenu={$inMenu}>
		<Replay {replayFile} />
	</div>
{/if}

<div class="menu" class:inMenu={$inMenu}>
	<div class="menuContainer">
		<h1>JSTLZIO</h1>
		<div class="tabs">
			{#each menus as menuType}
				<button
					class:selected={menuType.id === currentMenu}
					on:click={() => {
						currentMenu = menuType.id;
					}}>{menuType.name}</button
				>
			{/each}
		</div>
		<div class="content">
			{#if currentMenu === "play"}
				<div class="gameModeList">
					{#each Object.keys(GameModes) as gameMode}
						{#if !GameModes[gameMode].hidden}
							<button
								class="gameMode"
								class:selected={gameMode === currentGameMode}
								on:click={() => {
									gameView = "game";
									currentGameMode = gameMode;
									$inMenu = false;
								}}
							>
								<div>
									<h2>{GameModes[gameMode].title}</h2>
									{#if gameMode === currentGameMode}
										<p style="color: #0F0;">Press ESC to return to game</p>
									{/if}
								</div>
								<p>{GameModes[gameMode].description}</p>
							</button>
						{/if}
					{/each}
				</div>
			{/if}
			{#if currentMenu === "replays"}
				<div class="gameModeList">
					<textarea bind:value={replayFile} />
					<button
						class="gameMode"
						on:click={() => {
							gameView = "replay";
							$inMenu = false;
						}}
					>
						<div>
							<h1>go</h1>
						</div>
					</button>
				</div>
			{/if}
			{#if currentMenu === "settings"}
				<div class="settingList">
					<Heading name="Handling" description="Change the feel of the controls" />
					<Setting
						name="DAS"
						bind:value={$userConfig.das}
						description="Delayed Auto Shift: Delay between pressing the key and repeating the input automatically"
						unit="ms"
						type="number"
					/>
					<Setting
						name="ARR"
						bind:value={$userConfig.arr}
						description="Auto Repeat Rate: The delay between the repeated input"
						unit="ms"
						type="number"
					/>
					<Setting
						name="SDF"
						bind:value={$userConfig.sdf}
						description="Soft Drop Factor: Multiplies how quickly a piece drops when down is pressed"
						unit="X"
						type="number"
					/>
					<Heading name="Controls" />
					<KeybindSetting name="Left" command="gameLeft" />
					<KeybindSetting name="Right" command="gameRight" />
					<KeybindSetting name="Soft Drop" command="gameDown" />
					<KeybindSetting name="Hard Drop" command="gameDrop" />
					<KeybindSetting name="Sonic Drop" command="gameSonic" />
					<KeybindSetting name="Dip" command="gameDip" />
					<KeybindSetting name="Rotate CW" command="gameCW" />
					<KeybindSetting name="Rotate CCW" command="gameCCW" />
					<KeybindSetting name="Rotate 180" command="gameFlip" />
					<KeybindSetting name="Hold" command="gameHold" />
					<KeybindSetting name="Restart" command="gameRestart" />
					<Heading name="Audio" />
					<Setting
						name="Master"
						bind:value={$userConfig.masterVol}
						description="Adjust the volume of the entire game"
						unit="%"
						type="number"
					/>
					<Setting
						name="SFX"
						bind:value={$userConfig.sfxVol}
						description="Adjust the volume of SFX"
						unit="%"
						type="number"
					/>
					<Heading name="Extra" />
					<Setting
						name="Console Game"
						bind:value={$userConfig.consoleGame}
						description="Play in the browser console"
						type="toggle"
					/>
					<Setting
						name="Grid Lines"
						bind:value={$userConfig.showGridLines}
						description="Show grid lines on the game board"
						type="toggle"
					/>
					<Setting name="Debug Enabled" bind:value={$userConfig.debugEnabled} description="" type="toggle" />
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.game {
		transition: var(--menu-transition);
		&.inMenu {
			filter: blur(24px) grayscale(0.4);
			transform: scale(0.8);
			opacity: 0.5;
			pointer-events: none;
		}
		width: 100%;
		height: 100%;
		font-size: min(1em, 2vh);
		--pad: min(12px, 1.3vh);
	}
	.menu {
		inset: 0;
		background: #8882;
		border-bottom: 0.4em solid #fff8;
		transition: var(--menu-transition);
		&:not(.inMenu) {
			pointer-events: none;
			transform: translateY(-100%);
			// opacity: 0;
		}
		padding: calc(var(--pad) * 3);
		padding-bottom: 0;
		display: flex;
		justify-content: center;
		overflow: auto;
		.menuContainer {
			display: grid;
			grid-template-columns: 1fr;
			grid-template-rows: 5em 5em 1fr;
			justify-items: center;
			align-items: center;
			width: 100%;
			max-width: 1400px;
			h1 {
				font-size: 3em;
				margin: 0;
			}
			.tabs {
				display: flex;
				align-items: stretch;
				width: 100%;
				height: 100%;
				button {
					flex: 1;
					background-color: transparent;
					border-bottom: 0.125em solid #fff2;
					color: #fff4;
					box-sizing: border-box;
					font-size: 2em;
					cursor: pointer;
					&.selected {
						border-bottom: 0.25em solid #fff;
						color: #fff;
						font-weight: 700;
					}
				}
			}
			.content {
				width: 100%;
				height: 100%;
				min-height: 10em;
				padding-top: calc(var(--pad) * 3);
				padding-bottom: calc(var(--pad) * 3);
				overflow: auto;
				&::-webkit-scrollbar {
					width: calc(var(--pad) * 2 + 0.5em);
				}
				&::-webkit-scrollbar-track {
					border-right: 0.5em solid #8884;
				}
				&::-webkit-scrollbar-thumb {
					border-right: 0.5em solid #fff4;
				}
				&::-webkit-scrollbar-button:start:increment,
				&::-webkit-scrollbar-button:end:increment {
					height: calc(var(--pad) * 3);
					display: block;
					background: transparent;
				}
			}
			.gameModeList {
				display: grid;
				width: 100%;
				box-sizing: border-box;
				grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
				gap: calc(var(--pad) * 3);
				.gameMode {
					height: 11em;
					text-align: start;
					padding: calc(var(--pad) * 1.5);
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					h2 {
						margin: 0;
						font-size: 1.5em;
					}
					&.selected {
						background-color: #4f42;
					}
				}
			}
			.settingList {
				display: flex;
				flex-direction: column;
				width: 100%;
				gap: calc(var(--pad) * 3);
				scrollbar-width: thin;
			}
		}
	}
</style>
