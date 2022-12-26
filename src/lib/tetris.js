import blocks from "./blocks.js";
import kicks from "./kicks.js";

export const sx = 10;
export const sy = 20;
export const floorMoveLimit = 15;
export const queueLength = 5;

function iterateAll(callback) {
	for (let i = 0; i < sy; i++) {
		for (let j = 0; j < sx; j++) {
			callback(i, j);
		}
	}
}

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

export default class TetrisGame {
	constructor({ randomSeed } = { randomSeed: null }) {
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
		this.tickDelay = 1000;
		this.gameOver = false;
		// this.autoTick = autoTick;
		this.numLinesCleared = 0;
		this.initialSeed = randomSeed || Math.floor(Math.random() * 1000000);
		this.seed = this.initialSeed;
		this.bag = [];
		this.queue = [];
		this.onLinesCleared = (clearedLines) => {};
		this.onGameOver = () => {};
		this.onRequestTick = (dt) => {};
		this.onCancelTick = () => {};
		this.onDrop = () => {};

		while (this.queue.length < queueLength) {
			this.queue.push(this.genRandomPiece());
		}
		this.resetBag();
	}

	resetGame(newInitialSeed = null) {
		this.onCancelTick();
		this.numLinesCleared = 0;
		this.staticMatrix = [];
		for (let i = 0; i < sy; i++) {
			this.staticMatrix[i] = [];
			for (let j = 0; j < sx; j++) {
				this.staticMatrix[i][j] = null;
			}
		}
		this.activePiece = null;
		this.gameOver = false;
		this.tickDelay = 1000;
		this.holdPiece = null;
		this.holdAvailable = true;
		this.initialSeed = newInitialSeed || Math.floor(Math.random() * 1000000);
		this.seed = this.initialSeed;
		this.resetBag();
	}

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

	triggerGameOver() {
		this.onCancelTick();
		this.gameOver = true;
		this.activePiece = null;
		this.onGameOver();
	}

	genRandomNumber() {
		return (this.seed = (742938285 * this.seed) % (2 ** 31 - 1));
	}

	resetBag() {
		if (this.bag.length === 0) {
			blocks.forEach((x) => this.bag.push(x));
		}
	}

	genRandomPiece() {
		this.resetBag();
		const length = this.bag.length;
		const index = this.genRandomNumber() % length;
		this.queue.push(this.bag.splice(index, 1)[0]);
		return this.queue.shift();
	}

	spawnBlock() {
		const chosenBlock = this.genRandomPiece();
		// console.error(chosenBlock);
		let newPiece = {
			...chosenBlock,
			x: chosenBlock.spawnX,
			y: chosenBlock.spawnY,
			floorMoves: 0,
			originalShape: deepCopy2d(chosenBlock.shape),
			rotationState: 0,
		};
		if (this.checkMiniMatrixCollision(newPiece)) {
			this.triggerGameOver();
			return true;
		} else {
			this.activePiece = newPiece;
			return false;
		}
	}

	overlay(staticMatrix, piece, options = {}) {
		let rotatedPiece;
		if (piece) {
			rotatedPiece = this.calculateRotatedPiece(piece);
		} else {
			return staticMatrix;
		}
		let renderedGrid = [];
		for (let i = 0; i < sy; i++) {
			renderedGrid[i] = [];
			for (let j = 0; j < sx; j++) {
				renderedGrid[i][j] = staticMatrix[i][j];
				if (piece) {
					const { x, y, shape } = rotatedPiece;
					if (shape[i - y] && shape[i - y][j - x]) {
						renderedGrid[i][j] = { type: piece.type, ...options };
					}
				}
			}
		}
		return renderedGrid;
	}

	flatten() {
		return this.overlay(this.staticMatrix, this.activePiece);
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

	tick() {
		if (this.translateActivePiece(0, 1)) {
			this.runPieceLockSequence();
		}
		this.onRequestTick(this.tickDelay);
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
		return clearedLines;
	}

	runPieceLockSequence() {
		const events = [];
		this.staticMatrix = this.flatten();
		events.push(this.spawnBlock());
		const clearedLines = this.clearFilledLines();
		if (clearedLines > 0) {
			this.numLinesCleared += clearedLines;
			this.onLinesCleared(clearedLines);
			events.push(true);
		}
		this.holdAvailable = true;
		this.onDrop({ otherEventsFired: events.some((x) => x) });
	}

	resetTickIfAboutToLock() {
		if (this.activePiece) {
			if (this.translateActivePiece(0, 1, true)) {
				if (this.activePiece.floorMoves < floorMoveLimit) {
					this.onCancelTick();
					this.onRequestTick(this.tickDelay);
					this.activePiece.floorMoves++;
				} else {
					this.runPieceLockSequence();
				}
			} else {
				this.activePiece.floorMoves = 0;
			}
		}
		// console.log(this.activePiece.floorMoves);
	}

	move(x, y) {
		if (this.activePiece) {
			const collision = this.translateActivePiece(x, y);
			if (!collision) {
				this.resetTickIfAboutToLock();
			}
			return collision;
		} else {
			return true;
		}
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

	rotate(n) {
		let newPiece = { ...this.activePiece, rotationState: (this.activePiece.rotationState + n) % 4 };
		let kickset = kicks.find((kickset) => kickset.appliesTo.includes(this.activePiece.type))?.kicks?.[
			this.activePiece.rotationState
		]?.[newPiece.rotationState] || [[0, 0]];
		console.log(this.activePiece.type, kicks, kickset);
		for (let i = 0; i < kickset.length; i++) {
			let newTraslatedPiece = { ...newPiece, x: newPiece.x + kickset[i][0], y: newPiece.y + kickset[i][1] };
			if (!this.checkMiniMatrixCollision(newTraslatedPiece)) {
				this.activePiece = newTraslatedPiece;
				this.resetTickIfAboutToLock();
				return false;
			}
		}
		return true;
	}

	// tetrominoKicks[I][rot + CCW][test#]
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
			this.onCancelTick();
			this.onRequestTick(this.tickDelay);
			return false;
		}
		return true;
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

	renderWithGhost() {
		if (!this.activePiece) return this.flatten();
		return this.overlay(this.overlay(this.staticMatrix, this.ghostPiece, { ghost: true }), this.activePiece);
	}

	get grid() {
		return this.renderWithGhost();
	}

	start() {
		this.spawnBlock();
		this.onRequestTick(this.tickDelay);
	}
}
