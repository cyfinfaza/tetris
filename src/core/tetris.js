import tetrisBlocks from "~/constants/blocks/blocks.js";
import srsPlus from "~/constants/kicks/srs+.js";

export const sx = 10; // SizeX
export const sy = 40; // SizeY
export const ry = 20; // RenderedY

function deepCopy2d(arr) {
	let newArr = [];
	for (let i = 0; i < arr.length; i++) {
		newArr[i] = [];
		for (let j = 0; j < arr[i].length; j++) {
			newArr[i][j] = arr[i][j];
		}
	}
	return newArr;
}

const defaultConfig = {
	randomSeed: null,
	floorMoveLimit: 15,
	queueLength: 5,
	blockSet: tetrisBlocks,
	kickSet: srsPlus,
};

export default class {
	constructor(config = defaultConfig) {
		this.config = { ...defaultConfig, ...config };
		this.onLinesCleared = (e) => {};
		this.onGameOver = () => {};
		this.onGameComplete = () => {};
		this.onRequestGravity = (dt) => {};
		this.onCancelGravity = () => {};
		this.onSpawnBlock = (e) => {};
		this.onDrop = (e) => {};
		this.onPause = () => {};
		this.onResume = () => {};
		this.onPerfectClear = () => {};
		this.onSpin = (e) => {};
		this.initGame(config);
		console.log(this.config);
	}

	// BEGIN GAME INIT FUNCTIONS

	resetGame(config) {
		this.onCancelGravity();
		this.initGame({ randomSeed: null, ...config });
	}

	initGame(newConfig) {
		this.config = { ...this.config, ...newConfig };
		const { randomSeed } = this.config;
		this.staticMatrix = [];
		for (let i = 0; i < sy; i++) {
			this.staticMatrix[i] = [];
			for (let j = 0; j < sx; j++) {
				this.staticMatrix[i][j] = null;
			}
		}
		this.activePiece = null;
		this.holdPiece = null;
		this.holdAvailable = true;
		this.gravityLevel = 1/60; // "G" Level, 1G = 1 cell / frame, or 1 cell / (1/60) seconds, or 60 cells/s
		this.lockDelay = 500;
		this.lockTimeout = null;
		this.gameOver = false;
		this.numLinesCleared = 0;
		this.currentCombo = 0;
		this.comboActive = false;
		this.initialSeed = randomSeed || Math.floor(Math.random() * 1000000);
		this.seed = this.initialSeed;
		this.bag = [];
		this.queue = [];
		this._running = false;
		this.lastSpin = null;

		while (this.queue.length < this.config.queueLength) {
			this.queue.push(this.genRandomPiece());
		}
		this.resetBag();
	}

	start() {
		this.spawnBlock();
		this.onRequestGravity(this.gravityLevel);
		this.running = true;
	}

	set running(newState) {
		if (!newState && this._running) {
			this.onCancelGravity();
			this._running = false;
			this.onPause();
		}
		if (newState && !this._running) {
			this.applyGravity(this.gravityLevel);
			this._running = true;
			this.onResume();
		}
	}

	get running() {
		return this._running;
	}

	triggerGameOver() {
		this.onCancelGravity();
		this.gameOver = true;
		this.activePiece = null;
		this.onGameOver();
	}

	triggerGameComplete() {
		this.onCancelGravity();
		this.gameOver = true;
		this.activePiece = null;
		this.onGameComplete();
	}

	// END GAME INIT FUNCTIONS
	// BEGIN RANDOMIZATION FUNCTIONS

	genRandomNumber() {
		return (this.seed = (742938285 * this.seed) % (2 ** 31 - 1));
	}

	resetBag() {
		if (this.bag.length === 0) {
			this.config.blockSet.forEach((x) => this.bag.push(x));
		}
	}

	genRandomPiece() {
		this.resetBag();
		const length = this.bag.length;
		const index = this.genRandomNumber() % length;
		this.queue.push(this.bag.splice(index, 1)[0]);
		return this.queue.shift();
	}

	// END RANDOMIZATION FUNCTIONS
	// BEGIN GEOMETRY UTILITY FUNCTIONS

	checkMiniMatrixCollision(piece) {
		const { x, y, shape } = this.calculateRotatedPiece(piece);
		for (let i = 0; i < shape.length; i++) {
			for (let j = 0; j < shape[i].length; j++) {
				const ai = y + i;
				const aj = x + j;
				if (shape[i][j] && (ai >= sy || aj < 0 || aj >= sx || (ai >= 0 ? this.staticMatrix[ai][aj] : false))) {
					return true;
				}
			}
		}
	}

	rotateMiniMatrix(matrix, dir = 1) {
		let newMatrix = matrix;
		for (let _ = 0; _ < dir; _++) {
			newMatrix = [];
			for (let i = 0; i < matrix.length; i++) {
				newMatrix[i] = [];
				for (let j = 0; j < matrix[i].length; j++) {
					// console.log(dir);
					newMatrix[i][j] = matrix[matrix.length - j - 1][i];
				}
			}
			matrix = newMatrix;
		}
		return newMatrix;
	}

	calculateRotatedPiece(piece) {
		return { ...piece, shape: this.rotateMiniMatrix(piece.shape, piece.rotationState), rotationState: 0 };
	}

	checkTCorners(piece) {
		const checkCorner = (x, y) => {
			if (x < 0 || x >= sx || y < 0 || y >= sy) {
				return 1;
			}
			// console.table(this.staticMatrix);
			// console.log(x, y, this.staticMatrix[x][y]);
			return !!this.staticMatrix[y][x];
		};

		let corners = 0;
		let facingCorners = 0;

		const x = piece.x;
		const y = piece.y;
		const rot = piece.rotationState;

		const tl = checkCorner(x, y);
		const tr = checkCorner(x + 2, y);
		const bl = checkCorner(x, y + 2);
		const br = checkCorner(x + 2, y + 2);

		corners = tl + tr + bl + br;
		switch (rot) {
			case 0:
				facingCorners = tl + tr;
				break;
			case 1:
				facingCorners = tr + br;
				break;
			case 2:
				facingCorners = br + bl;
				break;
			case 3:
				facingCorners = bl + tl;
				break;
		}

		const isSpin = corners >= 3;
		const isMini = facingCorners < 2 && isSpin;

		return { isSpin, isMini };
	}

	checkPieceMobility(piece) {
		const rotatedPiece = piece;
		const tests = [
			[0, 1],
			[0, -1],
			[1, 0],
			[-1, 0],
		];
		for (let i = 0; i < tests.length; i++) {
			const [dx, dy] = tests[i];
			const testPiece = { ...rotatedPiece, x: rotatedPiece.x + dx, y: rotatedPiece.y + dy };
			if (!this.checkMiniMatrixCollision(testPiece)) {
				return true;
			}
		}
		return false;
	}

	overlay(staticMatrix, piece, options = {}, requireInBounds = false) {
		let rotatedPiece;
		if (piece) {
			rotatedPiece = this.calculateRotatedPiece(piece);
		} else {
			return staticMatrix;
		}
		let renderedGrid = [];
		let inBounds = false;
		for (let i = 0; i < sy; i++) {
			renderedGrid[i] = [];
			for (let j = 0; j < sx; j++) {
				renderedGrid[i][j] = staticMatrix[i][j];
				if (piece) {
					const { x, y, shape } = rotatedPiece;
					if (shape[i - y] && shape[i - y][j - x]) {
						renderedGrid[i][j] = { type: piece.type, bracket: piece.bracket || false, ...options };
						if (i > sy-ry-1) {
							inBounds = true;
						}
					}
				}
			}
		}
		if (!inBounds && requireInBounds) {
			this.triggerGameOver();
		}
		return renderedGrid;
	}

	flatten() {
		return this.overlay(this.staticMatrix, this.activePiece);
	}

	get ghostPiece() {
		if (!this.activePiece) return null;
		let ghostPiece = { ...this.activePiece };
		while (!this.checkMiniMatrixCollision(ghostPiece) && ghostPiece.y < sy) {
			ghostPiece.y++;
		}
		ghostPiece.y--;
		return ghostPiece;
	}

	// END GEOMETRY UTILITY FUNCTIONS
	// BEGIN GAME LOGIC FUNCTIONS

	spawnBlock() {
		const chosenBlock = this.genRandomPiece();
		this.checkLockTimeout();
		// console.log(chosenBlock.bracket);
		let newPiece = {
			...chosenBlock,
			x: chosenBlock.spawnX,
			y: chosenBlock.spawnY,
			floorMoves: 0,
			originalShape: deepCopy2d(chosenBlock.shape),
			rotationState: 0,
		};
		this.onSpawnBlock(newPiece);
		if (this.checkMiniMatrixCollision(newPiece)) {
			this.triggerGameOver();
			return true;
		} else {
			this.activePiece = newPiece;
			return false;
		}
	}

	translateActivePiece(dx, dy, dry = false) {
		if (!this.activePiece) return;
		let newPiece = { ...this.activePiece, x: this.activePiece.x + dx, y: this.activePiece.y + dy };
		if (this.checkMiniMatrixCollision(newPiece)) {
			return true;
		} else {
			if (!dry) this.activePiece = newPiece;
			return false;
		}
	}

	clearFilledLines() {
		let clearedLines = 0;
		for (let i = 0; i < sy; i++) {
			if (this.staticMatrix[i].every((cell) => cell !== null)) {
				clearedLines++;
				this.staticMatrix.splice(i, 1);
				this.staticMatrix.unshift(new Array(sx).fill(null));
			}
		}
		let totalPieces = 0;
		for (let i = 0; i < sy; i++) {
			for (let j = 0; j < sx; j++) {
				if (this.staticMatrix[i][j]) totalPieces++;
			}
		}
		if (totalPieces === 0) this.onPerfectClear();
		return { clearedLines, isPerfectClear: totalPieces === 0 };
	}

	runPieceLockSequence() {
		const events = [];
		this.staticMatrix = this.flatten();
		clearInterval(this.lockTimeout);
		this.lockTimeout = null;
		const { clearedLines, isPerfectClear } = this.clearFilledLines();
		if (clearedLines > 0) {
			this.currentCombo += 1;
			this.comboActive = true;
			this.numLinesCleared += clearedLines;
			this.onLinesCleared({ numLines: clearedLines, ...(this.lastSpin || {}), isPerfectClear });
			this.lastSpin = null;
			events.push(true);
		} else {
			this.overlay(this.staticMatrix, this.activePiece, {}, true);
			this.currentCombo = 0;
			this.comboActive = false;
		}
		events.push(this.spawnBlock());
		this.holdAvailable = true;
		this.onDrop({ otherEventsFired: events.some((x) => x) });
	}

	resetGravityIfAboutToLock() {
		if (this.activePiece) {
			if (this.translateActivePiece(0, 1, true)) {
				if (this.activePiece.floorMoves < this.config.floorMoveLimit) {
					this.checkLockTimeout();
					this.onCancelGravity();
					this.onRequestGravity(this.gravityLevel);
					this.activePiece.floorMoves++;
				} else {
					this.runPieceLockSequence();
				}
			}
		}
		// console.log(this.activePiece.floorMoves);
	}

	// END GAME LOGIC FUNCTIONS
	// BEGIN GENERAL FORM GAME CONTROL FUNCTIONS

	move(x, y) {
		if (this.activePiece) {
			const collision = this.translateActivePiece(x, y);
			if (!collision) {
				this.lastSpin = null;
				this.resetGravityIfAboutToLock();
			}
			return collision;
		} else {
			return true;
		}
	}

	checkSpin(rot, kick) {
		if (this.activePiece) {
			if (this.activePiece.type === "T") {
				const spin = this.checkTCorners(this.activePiece);
				if ((rot === 0 && kick === 4) || (rot === 2 && kick === 4)) {
					spin.isMini = false;
				}
				return spin;
			} else {
				return { isSpin: !this.checkPieceMobility(this.activePiece), isMini: false };
			}
		}
	}

	rotate(n) {
		if (this.activePiece) {
			let newPiece = { ...this.activePiece, rotationState: (this.activePiece.rotationState + n) % 4 };
			let kickset = this.config.kickSet.find((kickset) => kickset.appliesTo.includes(this.activePiece.type))?.kicks?.[
				this.activePiece.rotationState
			]?.[newPiece.rotationState] || [[0, 0]];
			// console.log(this.activePiece.type, kicks, kickset);
			for (let i = 0; i < kickset.length; i++) {
				let newTraslatedPiece = { ...newPiece, x: newPiece.x + kickset[i][0], y: newPiece.y + kickset[i][1] };
				if (!this.checkMiniMatrixCollision(newTraslatedPiece)) {
					const prevRot = this.activePiece.rotationState;
					this.activePiece = newTraslatedPiece;
					const spinData = this.checkSpin(prevRot, i);
					if (spinData.isSpin) {
						this.lastSpin = { ...spinData, spinType: this.activePiece.type };
						this.onSpin({ type: this.activePiece.type, isMini: spinData.isMini || false });
					} else {
						this.lastSpin = null;
					}
					this.resetGravityIfAboutToLock();
					return false;
				}
			}
		}
		return true;
	}

	checkLockTimeout() {
		if (this.lockDelay == Infinity || this.lockDelay == null) {
			return;
		}
		const attemptLockDelay = () => {
			if (this.translateActivePiece(0, 1, true)) {
				this.runPieceLockSequence();
			}
		}

		if (this.activePiece === null) { return; }
		if (this.translateActivePiece(0, 1, true)) {
			clearTimeout(this.lockTimeout);
			this.lockTimeout = setTimeout(() => { attemptLockDelay(); }, this.lockDelay);
		}
	}

	// END GENERAL FORM GAME CONTROL FUNCTIONS
	// BEGIN GAME INPUT HANDLERS

	applyGravity() {
		let ret = false;
		if (this.translateActivePiece(0, 1)) {
			ret = true;
		} else {
			this.checkLockTimeout();
			this.lastSpin = null;
		}
		this.onRequestGravity(this.gravityLevel);
		return ret;
	}

	right() {
		return this.move(1, 0);
	}

	left() {
		return this.move(-1, 0);
	}

	down() {
		return this.move(0, 1);
	}

	dip() {
		this.onCancelGravity();
		return this.applyGravity();
	}

	rotateCCW() {
		return this.rotate(3);
	}

	rotateCW() {
		return this.rotate(1);
	}

	rotateFlip() {
		return this.rotate(2);
	}

	hardDrop() {
		if (!this.gameOver) {
			while (this.activePiece && !this.translateActivePiece(0, 1)) {}
			this.runPieceLockSequence();
		}
	}

	sonicDrop() {
		if (!this.gameOver) {
			let ret = true;
			while (this.activePiece && !this.move(0, 1)) { ret = false; }
			return ret;
		}
	}

	hold() {
		if (this.holdAvailable && !this.gameOver) {
			if (this.holdPiece) {
				[this.activePiece, this.holdPiece] = [
					{
						...this.holdPiece,
						x: this.holdPiece.spawnX,
						y: this.holdPiece.spawnY,
						shape: this.holdPiece.shape,
					},
					{
						...this.activePiece,
						x: this.activePiece.spawnX,
						y: this.activePiece.spawnY,
						rotationState: 0,
						shape: this.activePiece.shape,
					},
				];
			} else {
				this.holdPiece = {
					...this.activePiece,
					x: this.activePiece.spawnX,
					y: this.activePiece.spawnY,
					rotationState: 0,
					shape: this.activePiece.shape,
				};
				this.spawnBlock();
			}
			this.holdAvailable = false;
			this.onCancelGravity();
			this.onRequestGravity(this.gravityLevel);
			return false;
		}
		return true;
	}

	// END GAME INPUT HANDLERS
	// BEGIN COMPLETE RENDER FUNCTIONS

	renderWithGhost() {
		if (!this.activePiece) return this.flatten().slice(ry, sy);
		return this.overlay(this.overlay(this.staticMatrix, this.ghostPiece, { ghost: true }), this.activePiece).slice(ry, sy);
	}

	get grid() {
		return this.renderWithGhost();
	}

	// END COMPLETE RENDER FUNCTIONS
}
