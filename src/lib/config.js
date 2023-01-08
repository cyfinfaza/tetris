export const defaultUserConfig = {
	das: 140,
	arr: 10,
	sdf: 5,
	masterVol: 50,
	sfxVol: 50,
	consoleGame: false,
	showGridLines: false,
	debugEnabled: false,

	// Controls are based off the QWERTY layout. All keys are physical
	controls: {
		ArrowRight: ["gameRight",   "menuRight"],
		ArrowLeft:  ["gameLeft",    "menuLeft"],
		ArrowDown:  ["gameDown",    "menuDown"],
		ArrowUp:    ["gameCW",      "menuUp"],
		Space:      ["gameDrop",    "menuSelect"],
		KeyA:       ["gameFlip",    ""],
		KeyZ:       ["gameCCW",     ""],
		ControlLeft:["gameCCW",     ""],
		KeyX:       ["gameCW",      ""],
		KeyR:       ["gameRestart", ""],
		KeyC:       ["gameHold",    ""],
		ShiftLeft:  ["gameHold",    ""],
		Enter:      ["menuSelect",  ""],
		Escape:     ["gamePause",   "menuBack"],
		Backspace:  ["menuBack",    ""],
	}
};
