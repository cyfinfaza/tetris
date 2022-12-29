import { Howl, Howler } from "howler";
import { userConfig, windowInFocus } from "./stores";
import { get } from "svelte/store";

Howler.volume(0.5);

export const sounds = {
	move: new Howl({
		src: ["sfx/set1/move2.wav"],
		volume: 0.1,
	}),
	movefail: new Howl({
		src: ["sfx/set1/movefail.wav"],
	}),
	drop: new Howl({
		src: ["sfx/set1/drop.wav"],
	}),
	hold: new Howl({
		src: ["sfx/set1/hold.wav"],
	}),
	clear: new Howl({
		src: ["sfx/set1/clear 1.wav"],
	}),
	clear2: new Howl({
		src: ["sfx/set1/clear 2.wav"],
	}),
	clear3: new Howl({
		src: ["sfx/set1/clear 3.wav"],
	}),
	clearTetris: new Howl({
		src: ["sfx/set1/clear tetris.wav"],
	}),
	gameover: new Howl({
		src: ["sfx/set1/gameover.wav"],
	}),
	restart: new Howl({
		src: ["sfx/set1/restart.wav"],
	}),
};

export function playMoveSFX(fail) {
	if (fail) {
		// sounds.movefail.play();
	} else {
		sounds.move.play();
	}
}

export function playDropSFX() {
	sounds.drop.play();
}

export function playClearSFX(lines) {
	if (lines === 4) {
		sounds.clearTetris.play();
	} else if (lines === 3) {
		sounds.clear3.play();
	} else if (lines === 2) {
		sounds.clear2.play();
	} else {
		sounds.clear.play();
	}
}

export function playHoldSFX(fail) {
	if (fail) {
		sounds.movefail.play();
	} else {
		sounds.hold.play();
	}
}

function recheckMute() {
	Howler.mute(!get(userConfig).sfx || !get(windowInFocus));
}

userConfig.subscribe(recheckMute);
windowInFocus.subscribe(recheckMute);
