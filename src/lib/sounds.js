import { Howl, Howler } from "howler";
import { userConfig, windowInFocus } from "./stores";
import { get, writable } from "svelte/store";

Howler.volume(0.5);

export const sounds = {
	move: new Howl({
		src: ["/sfx/set1/move2.wav"],
	}),
	movefail: new Howl({
		src: ["/sfx/set1/movefail.wav"],
	}),
	drop: new Howl({
		src: ["/sfx/set1/drop.wav"],
	}),
	hold: new Howl({
		src: ["/sfx/set1/hold.wav"],
	}),
	clear: new Howl({
		src: ["/sfx/set1/clear 1.wav"],
	}),
	clear2: new Howl({
		src: ["/sfx/set1/clear 2.wav"],
	}),
	clear3: new Howl({
		src: ["/sfx/set1/clear 3.wav"],
	}),
	clearTetris: new Howl({
		src: ["/sfx/set1/clear tetris.wav"],
	}),
	gameover: new Howl({
		src: ["/sfx/set1/gameover.wav"],
	}),
	restart: new Howl({
		src: ["/sfx/set1/restart.wav"],
	}),
};

function playSFX(sound, vol = 1.0) {
	sound.volume((vol * get(userConfig).sfxVol) / 200);
	sound.play();
}

export function playMoveSFX(fail) {
	if (fail) {
		// playSFX(sounds.movefail);
	} else {
		playSFX(sounds.move, 0.1);
	}
}

export function playDropSFX() {
	playSFX(sounds.drop);
}

export function playClearSFX(lines) {
	if (lines === 4) {
		playSFX(sounds.clearTetris);
	} else if (lines === 3) {
		playSFX(sounds.clear3);
	} else if (lines === 2) {
		playSFX(sounds.clear2);
	} else {
		playSFX(sounds.clear);
	}
}

export function playHoldSFX(fail) {
	if (fail) {
		playSFX(sounds.movefail);
	} else {
		playSFX(sounds.hold);
	}
}

export function playRestartSFX() {
	playSFX(sounds.restart);
}

export function playGameoverSFX() {
	playSFX(sounds.gameover);
}

function recheckVolume() {
	Howler.volume(get(userConfig).masterVol / 100);
	Howler.mute(!get(userConfig).sfx || !get(windowInFocus) || get(generalSoundDisable));
}

export const generalSoundDisable = writable(false);

userConfig.subscribe(recheckVolume);
windowInFocus.subscribe(recheckVolume);
generalSoundDisable.subscribe(recheckVolume);
