<script>
	import { onMount, onDestroy } from "svelte";
	import blocks from "~/constants/blocks/blocks";
	import {
		sounds,
		playClearSFX,
		playMoveSFX,
		playDropSFX,
		playHoldSFX,
		playGameoverSFX,
		playRestartSFX,
	} from "~/lib/sounds";
	import Vis from "./Vis.svelte";
	import { createEventDispatcher } from "svelte";
	import { userConfig } from "~/lib/stores";
	import { inMenu } from "~/lib/stores";
	import { sx, sy } from "./tetris";

	const dispatch = createEventDispatcher();

	export let pauseEnabled = true;

	export let pieceElements;

	export let game;

	export let blurGame;
	export let inputDisabled = false;

	export let gravityEnabled = true;

	export let sidePane = null;

	let grid = game.grid;
	let queue = game.queue;
	let holdPiece = null;
	export let gameOver = false;

	let achievementMessages = [
		{ text: "", id: Math.random() },
		{ text: "", id: Math.random() },
	];

	let vis;

	let gravityTimeout = null;

	const measuredTimeoutLimit = 23;
	function measuredInterval(callback, dt, ...args) {
		const retValue = { timeout: null, running: true };
		let lastCall = Date.now();
		let totalMs = 0;

		function f() {
			if (!retValue.running) {
				return retValue;
			}
			const now = Date.now();
			totalMs += now - lastCall;
			lastCall = now;
			{
				let i = 0;
				while (i < measuredTimeoutLimit && totalMs > dt) {
					callback();
					totalMs -= dt;
					i++;
				}
				updateVis();
			}
			retValue.timeout = setTimeout(f, dt / 10, ...args);
			return retValue;
		}

		return f();
	}

	function clearMeasuredInterval(info) {
		if (info === null) {
			return;
		}
		info.running = false;
		clearTimeout(info.timeout);
	}

	let amIndex = 0;
	function updateAchievementMessage(e) {
		if (e.isPerfectClear) {
			achievementMessages[amIndex] = { text: "Perfect Clear", timestamp: Date.now(), id: Math.random() };
		}
		amIndex = (++amIndex % achievementMessages.length) - 1;
		const clearedWord =
			[
				"Single",
				"Double",
				"Triple",
				"Quad",
				"Quintris",
				"Sextris",
				"Kiliminojaro",
				"Octoris",
				"9tris",
				"Decatris",
				"11tris",
				"12 Minos Mining",
				"undefined",
				"[object Object]",
				"NaN",
				"Kagaris",
				"MONSTER-TRIS!!!",
				"18tris",
				"19tris",
				"20tris",
				"Kirbtris",
			]?.[e.numLines - 1] || e.numLines + "tris";
		let spinType = "";
		if (e.isSpin) {
			spinType = e.spinType + " Spin" + (e.isMini ? " Mini" : "");
		}
		achievementMessages[amIndex].text = `${spinType} ${clearedWord}`.trim();
		achievementMessages[amIndex].timestamp = Date.now();
		achievementMessages[amIndex].id = Math.random();
	}

	export function displayAchievement(text) {
		achievementMessages[amIndex] = { text, timestamp: Date.now(), id: Math.random() };
		amIndex = ++amIndex % 2;
	}

	function assignEventHandlersForGame(g) {
		g.onRequestGravity = (dt) => {
			if (gravityTimeout?.running || false) {
				dispatch("gravityRequested");
				return;
			}
			gravityTimeout = measuredInterval(() => {
				if (!gravityEnabled) {
					return;
				}
				g.applyGravity();
				updateVis();
			}, 1000 / 60 / dt);
			dispatch("gravityRequested");
		};
		g.onCancelGravity = () => {
			clearMeasuredInterval(gravityTimeout);
			dispatch("gravityCancelled");
		};
		g.onGameOver = () => {
			gameOver = true;
			playGameoverSFX();
			dispatch("gameOver");
		};
		g.onGameComplete = () => {
			gameOver = true;
			dispatch("gameComplete");
		};
		g.onSpawnBlock = (e) => {
			dispatch("spawnBlock", e);
		};
		g.onDrop = (e) => {
			if (!e.otherEventsFired) {
				playDropSFX();
			}
			updateVis();
			dispatch("drop", e);
		};
		g.onLinesCleared = (e) => {
			playClearSFX(e.numLines);
			updateAchievementMessage(e);
			dispatch("linesCleared", e);
		};
		g.onPause = () => {
			dispatch("pause");
		};
		g.onResume = () => {
			dispatch("resume");
		};
		g.onPerfectClear = () => {
			// console.log("perfect clear");
			dispatch("perfectClear");
		};
		g.onSpin = (e) => {
			// console.log(e.type + " spin", e);
			dispatch("spin", e);
		};
	}

	$: assignEventHandlersForGame(game);
	$: if (pauseEnabled) game.running = !$inMenu;

	window.game = game;
	window.grid = grid;

	// $: console.table(grid);

	export function updateVis() {
		grid = game.grid;
		holdPiece = game.holdPiece;
		queue = game.queue;
	}

	export function restartGame() {
		clearTimeout(gravityTimeout);
		gameOver = false;
		updateVis();
		vis.shake();
		vis.focus();
		playRestartSFX();
	}

	function spawnGarbage(rows = 1, cheeseArray) {
		for (let y = 0; y < sy; y++) {
			if (y < sy - rows) {
				game.staticMatrix[y] = game.staticMatrix[y + rows];
			} else {
				game.staticMatrix[y] = [...cheeseArray];
			}
		}
	}

	export function cheeseGarbage(rows = 1, cheeseColumn = (Math.random() * sx) | 0) {
		const cheeseArray = new Array(sx).fill({ type: "clearable-garbage" });
		cheeseArray[cheeseColumn] = null;

		spawnGarbage(rows, cheeseArray);
	}

	export function cloneGarbage(rows = 1) {
		const cheeseArray = [...game.staticMatrix[sy - 1]].map((v) => (v === null ? null : { type: "clearable-garbage" }));

		spawnGarbage(rows, cheeseArray);
	}

	let dasTimeout = null;
	let arrInterval = null;
	let dasDirection = null;
	function setDasTimeout(callback) {
		callback();
		updateVis();

		clearMeasuredInterval(arrInterval);
		dasTimeout = setTimeout(() => {
			clearMeasuredInterval(arrInterval);
			arrInterval = measuredInterval(() => {
				callback();
				updateVis();
			}, $userConfig.arr);
		}, $userConfig.das);

		// function setArrTimeout() {
		// 	clearMeasuredTimeout(dasTimeout);
		// 	dasTimeout = measuredTimeout(() => {
		// 		callback();
		// 		updateVis();
		// 		setArrTimeout(callback);
		// 	}, arr);
		// }
		// callback();
		// clearMeasuredTimeout(dasTimeout);
		// dasTimeout = setTimeout(() => {
		// 	callback();
		// 	updateVis();
		// 	clearMeasuredTimeout(dasTimeout);
		// 	setArrTimeout();
		// }, das);
	}

	let downInterval = null;
	function setDownTimeout(callback) {
		const dt = 1000 / 60 / game.gravityLevel / 20 / $userConfig.sdf; // G_down = G * 20 * SDF, as per Tetris Guideline
		clearMeasuredInterval(downInterval);
		downInterval = measuredInterval(callback, dt);
	}

	$: if ($userConfig.consoleGame)
		console.log(
			grid.map((row) => row.map((cell) => "%c  ").join("")).join("\n"),
			...grid.reduce(
				(prev, curr) => [
					...prev,
					...curr.map(
						(cell) =>
							"background-color:" +
							(cell ? (cell.ghost ? "#333" : blocks.find((block) => block.type === cell.type).color) : "black") +
							"; border-radius: 50%; margin: 1px;"
					),
				],
				[]
			)
		);

	let controlMapDown = {};
	let controlMapUp = {};

	function updateControls(controls) {
		console.log(controls);
		controlMapDown = {};
		controlMapUp = {};

		Object.keys(controls).forEach(key => {
			const commands = controls[key];
			controlMapDown[key] = [];
			controlMapUp[key] = [];

			commands.forEach(command => {
				controlMapDown[key].push(command);
				if (["gameLeft", "gameRight", "gameDown"].indexOf(command) >= 0) {
					controlMapUp[key].push(command);
				}
			});
		});
	}

	$: updateControls($userConfig.controls);

	function handleKeyUp(e) {
		if (!controlMapUp[e.code]) return;
		controlMapUp[e.code].forEach(command => {
			switch (command) {
				case "gameLeft":
				case "gameRight":
					clearMeasuredInterval(arrInterval);
					if (dasDirection === e.key) {
						clearMeasuredInterval(arrInterval);
						clearTimeout(dasTimeout);
						dasDirection = null;
					}
					break;
				case "gameDown":
					clearMeasuredInterval(downInterval);
					break;
			}
		});
	}

	function handleKeyDown(e) {
		if (e.repeat) {
			return;
		}
		if (!$inMenu) {
			if (!controlMapDown[e.code]) return; 
			if (inputDisabled && controlMapDown[e.code].indexOf("gameRestart") < 0) return;

			controlMapDown[e.code].forEach(command => {
				switch (command) {
					case "gameLeft":
						setDasTimeout(() => playMoveSFX(game.left()));
						dasDirection = e.key;
						break;
					case "gameRight":
						setDasTimeout(() => playMoveSFX(game.right()));
						dasDirection = e.key;
						break;
					case "gameDown":
						setDownTimeout(() => playMoveSFX(game.down()));
						break;
					case "gameDrop":
						playMoveSFX(game.hardDrop());
						break;
					case "gameSonic":
						playMoveSFX(game.sonicDrop());
						break;
					case "gameDip":
						playMoveSFX(game.dip());
						break;
					case "gameCW":
						playMoveSFX(game.rotateCW());
						break;
					case "gameCCW":
						playMoveSFX(game.rotateCCW());
						break;
					case "gameFlip":
						playMoveSFX(game.rotateFlip());
						break;
					case "gameRestart":
						dispatch("restartRequested");
						break;
					case "gameHold":
						playHoldSFX(game.hold());
						break;
					case "gamePause":
						break;
				}
			});
			updateVis();
		}
	}

	onMount(() => {
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("keydown", handleKeyDown);
		updateVis();
	});
	onDestroy(() => {
		game.triggerGameComplete();
		window.removeEventListener("keyup", handleKeyUp);
		window.removeEventListener("keydown", handleKeyDown);
	});
</script>

<Vis
	{grid}
	{queue}
	{holdPiece}
	{gameOver}
	{sidePane}
	bind:this={vis}
	on:restartRequested
	bind:pieceElements
	bind:disabled={blurGame}
>
	<svelte:fragment slot="stats">
		<slot name="stats" />
	</svelte:fragment>
	<svelte:fragment slot="belowQueue">
		<div class="bottomRight">
			<slot name="gameName" />
		</div>
	</svelte:fragment>
	<svelte:fragment slot="belowHold">
		{#each achievementMessages as achievementMessage (achievementMessage.id)}
			<p class="bounceIn" style="font-size: 3em" style:transform={`rotate(${Math.random() * 20 - 10 + "deg"})`}>
				{achievementMessage.text || ""}
			</p>
		{/each}
	</svelte:fragment>
	<svelte:fragment slot="sidePane">
		<slot name="sidePane" />
	</svelte:fragment>
</Vis>

<style>
	.bottomRight {
		display: flex;
		flex-direction: column;
		align-self: stretch;
		gap: calc(var(--pad) / 2);
	}
	button {
		text-align: start;
	}
	@keyframes zoomIn {
		0% {
			transform: scale(0.5);
			opacity: 0;
		}
	}

	@keyframes fadeOut {
		100% {
			opacity: 0;
		}
	}

	.bounceIn {
		animation: zoomIn 240ms cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards, fadeOut 5s 240ms linear forwards;
	}
</style>
