<script>
	import { onMount, onDestroy } from "svelte";
	import blocks from "~/constants/blocks/blocks";
	import {
		sounds,
		playMoveSFX,
		playDropSFX,
		playClearSFX,
		playHoldSFX,
		playGameoverSFX,
		playRestartSFX,
	} from "~/lib/sounds";
	import Vis from "./Vis.svelte";
	import { createEventDispatcher } from "svelte";
	import { inReplay, userConfig } from "~/lib/stores";
	import { inMenu } from "~/lib/stores";
	import { sx, sy } from "./tetris";
	import { recordEvent, recordState, registerStateholder } from "~/lib/replayHolder";

	const dispatch = createEventDispatcher();

	export let state = {
		// pauseEnabled: true,
		// pieceElements: undefined,
		// game: undefined,
		// blurGame: undefined,
		// inputDisabled: false,
		// gravityEnabled: true,
		// sidePane: null,
		grid: undefined,
		queue: undefined,
		holdPiece: null,
		gameOver: false,
		achievementMessages: [
			{ text: "", id: Math.random() },
			{ text: "", id: Math.random() },
		],
		// vis: undefined,
		amIndex: 0,
	};
	window.setCgState = () => JSON.stringify(state);
	window.setCgState = (s) => {
		state = JSON.parse(s);
	};

	export let pauseEnabled = true;

	export let pieceElements;

	export let game;

	export let blurGame;

	export let inputDisabled = false;

	export let gravityEnabled = true;

	export let sidePane = null;

	// let state.grid = game.grid;
	// let state.queue = game.queue;
	// let state.holdPiece = null;
	// export let gameOver = false;

	// let state.achievementMessages = [
	// 	{ text: "", id: Math.random() },
	// 	{ text: "", id: Math.random() },
	// ];

	let vis;

	let gravityTimeout = null;

	const events = {
		start: () => {
			game.start();
			updateVis();
		},
		restartGame,
		gameOver: () => {
			state.gameOver = true;
			playGameoverSFX();
			dispatch("gameOver");
		},
		gameGravity: () => {
			if (!gravityEnabled) {
				return true;
			}
			game.applyGravity();
			updateVis();
		},
		gameLeft: () => {
			let ret;
			playMoveSFX((ret = game.left()));
			return ret;
		},
		gameRight: () => {
			let ret;
			playMoveSFX((ret = game.right()));
			return ret;
		},
		gameDown: () => {
			let ret;
			playMoveSFX((ret = game.down()));
			return ret;
		},
		gameDrop: () => {
			playMoveSFX(game.hardDrop());
		},
		gameSonic: () => {
			playMoveSFX(game.sonicDrop());
		},
		gameDip: () => {
			playMoveSFX(game.dip());
		},
		gameCW: () => {
			playMoveSFX(game.rotateCW());
		},
		gameCCW: () => {
			playMoveSFX(game.rotateCCW());
		},
		gameFlip: () => {
			playMoveSFX(game.rotateFlip());
		},
		gameHold: () => {
			playHoldSFX(game.hold());
		},
		gamePause: () => {},
	};

	registerStateholder("/core/CoreGame", {
		eventFire: (e) => fireEvent(e, false),
		stateFire: (s) => (state = { ...s, _disableRecord: true }),
	});

	registerStateholder("/core/tetris", {
		stateFire: (s) => game.setStateFromObj(s),
	});

	function fireEvent(eventName, records = true) {
		if (events[eventName]) {
			if (events[eventName]()) {
				console.log(events[eventName]);
				return;
			}
			if (records) recordEvent("/core/CoreGame", eventName);
			updateVis();
		}
	}

	$: {
		console.log("recording state", state);
		if (!state._disableRecord) {
			recordState("/core/CoreGame", state);
			recordState("/core/tetris", game);
		}
		delete state._disableRecord;
	}

	export function start() {
		fireEvent("start");
	}

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
				// updateVis();
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

	// let state.amIndex = 0;
	function updateAchievementMessage(e) {
		if (e.isPerfectClear) {
			state.achievementMessages[state.amIndex] = { text: "Perfect Clear", timestamp: Date.now(), id: Math.random() };
		}
		state.amIndex = ++state.amIndex % state.achievementMessages.length;
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
		state.achievementMessages[state.amIndex].text = `${spinType} ${clearedWord}`.trim();
		state.achievementMessages[state.amIndex].timestamp = Date.now();
		state.achievementMessages[state.amIndex].id = Math.random();
	}

	export function displayAchievement(text) {
		state.achievementMessages[state.amIndex] = { text, timestamp: Date.now(), id: Math.random() };
		state.amIndex = ++state.amIndex % state.achievementMessages.length;
	}

	function assignEventHandlersForGame(g) {
		let lockTimeout;
		g.onRequestGravity = (dt) => {
			if (!!gravityTimeout?.running || $inReplay) {
				dispatch("gravityRequested");
				return;
			}
			gravityTimeout = measuredInterval(() => {
				fireEvent("gameGravity");
			}, 1000 / 60 / dt);
			dispatch("gravityRequested");
		};
		g.onCancelGravity = () => {
			clearMeasuredInterval(gravityTimeout);
			clearTimeout(lockTimeout);
			if (g.translateActivePiece(0, 1, true)) {
				g.onTouchGround();
			}
			dispatch("gravityCancelled");
		};
		g.onTouchGround = () => {
			clearTimeout(lockTimeout);
			if ($inReplay || g.lockDelay === Infinity) return dispatch("touchGround");
			lockTimeout = setTimeout(() => {
				g.lockOnGround();
			}, (g.lockDelay * 1000) / 60);
			dispatch("touchGround");
		};
		g.onGameOver = () => {
			fireEvent("gameOver");
		};
		g.onGameComplete = () => {
			state.gameOver = true;
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
	window.grid = state.grid;

	// $: console.table(grid);

	export function updateVis() {
		state.grid = game.grid;
		state.holdPiece = game.holdPiece;
		state.queue = game.queue;
	}

	export function restartGame() {
		clearTimeout(gravityTimeout);
		state.gameOver = false;
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

	export function cheeseGarbage(rows = 1, cheeseColumn = game.genRandomNumber() % sx | 0) {
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
		if ($inReplay) return;
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
		if ($inReplay) return;
		downInterval = measuredInterval(() => {
			callback();
			updateVis();
		}, dt);
	}

	$: if ($userConfig.consoleGame)
		console.log(
			state.grid.map((row) => row.map((cell) => "%c  ").join("")).join("\n"),
			...state.grid.reduce(
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

		Object.keys(controls).forEach((key) => {
			const commands = controls[key];
			controlMapDown[key] = [];
			controlMapUp[key] = [];

			commands.forEach((command) => {
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
		controlMapUp[e.code].forEach((command) => {
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

			controlMapDown[e.code].forEach((command) => {
				switch (command) {
					case "gameLeft":
						setDasTimeout(() => fireEvent("gameLeft"));
						dasDirection = e.key;
						break;
					case "gameRight":
						setDasTimeout(() => fireEvent("gameRight"));
						dasDirection = e.key;
						break;
					case "gameDown":
						setDownTimeout(() => fireEvent("gameDown"));
						break;
					case "gameRestart":
						dispatch("restartRequested");
						break;
					case "gamePause":
						break;
					default:
						fireEvent(command);
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
	grid={state.grid}
	queue={state.queue}
	holdPiece={state.holdPiece}
	gameOver={state.gameOver}
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
		{#each state.achievementMessages as achievementMessage (achievementMessage.id)}
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

	/* @keyframes fadeOut {
		100% {
			opacity: 0;
		}
	} */

	.bounceIn {
		animation: zoomIn 240ms cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards, fadeOut 5s 240ms linear forwards;
	}
</style>
