import blocks from "./blocks.js";

export const sx = 10;
export const sy = 20;
export const floorMoveLimit = 15;

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
	constructor() {
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
		this.onLinesCleared = (clearedLines) => {};
		this.onGameOver = () => {};
		this.onRequestTick = (dt) => {};
		this.onCancelTick = () => {};
	}

	resetGame() {
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
	}

	checkMiniMatrixCollision({ x, y, shape }) {
		for (let i = 0; i < shape.length; i++) {
			for (let j = 0; j < shape[i].length; j++) {
				const ai = y + i;
				const aj = x + j;
				if (shape[i][j] && !(ai < 0) && (ai >= sy || aj < 0 || aj >= sx || this.staticMatrix[ai][aj])) {
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

	spawnBlock() {
		const chosenBlock = blocks[Math.floor(Math.random() * blocks.length)];
		// console.error(chosenBlock);
		let newPiece = {
			...chosenBlock,
			x: chosenBlock.spawnX,
			y: chosenBlock.spawnY,
			floorMoves: 0,
			originalShape: deepCopy2d(chosenBlock.shape),
		};
		if (this.checkMiniMatrixCollision(newPiece)) {
			this.triggerGameOver();
			return;
		} else {
			this.activePiece = newPiece;
		}
	}

	overlay(staticMatrix, piece, options = {}) {
		let renderedGrid = [];
		for (let i = 0; i < sy; i++) {
			renderedGrid[i] = [];
			for (let j = 0; j < sx; j++) {
				renderedGrid[i][j] = staticMatrix[i][j];
				if (piece) {
					const { x, y, shape } = piece;
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
		let newMatrix = [];
		for (let i = 0; i < matrix.length; i++) {
			newMatrix[i] = [];
			for (let j = 0; j < matrix[i].length; j++) {
				switch (dir) {
					case 1:
						newMatrix[i][j] = matrix[matrix.length - j - 1][i];
						break;
					case -1:
						newMatrix[i][j] = matrix[j][matrix.length - i - 1];
						break;
					case 0:
						newMatrix[i][j] = matrix[matrix.length - i - 1][matrix.length - j - 1];
						break;
				}
			}
		}
		return newMatrix;
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
		this.staticMatrix = this.flatten();
		this.spawnBlock();
		const clearedLines = this.clearFilledLines();
		if (clearedLines > 0) {
			this.numLinesCleared += clearedLines;
			this.onLinesCleared(clearedLines);
		}
		this.holdAvailable = true;
	}

	resetTickIfAboutToLock() {
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
		// console.log(this.activePiece.floorMoves);
	}

	right() {
		if (!this.translateActivePiece(1, 0)) this.resetTickIfAboutToLock();
	}

	left() {
		if (!this.translateActivePiece(-1, 0)) this.resetTickIfAboutToLock();
	}

	down() {
		if (!this.translateActivePiece(0, 1)) this.resetTickIfAboutToLock();
	}

	rotateCCW() {
		let newPiece = { ...this.activePiece, shape: this.rotateMiniMatrix(this.activePiece.shape, -1) };
		if (!this.checkMiniMatrixCollision(newPiece)) {
			this.activePiece = newPiece;
			this.resetTickIfAboutToLock();
		}
	}

	rotateCW() {
		let newPiece = { ...this.activePiece, shape: this.rotateMiniMatrix(this.activePiece.shape, 1) };
		if (!this.checkMiniMatrixCollision(newPiece)) {
			this.activePiece = newPiece;
			this.resetTickIfAboutToLock();
		}
	}
	
	rotateFlip() {
		let newPiece = { ...this.activePiece, shape: this.rotateMiniMatrix(this.activePiece.shape, 0) };
		if (!this.checkMiniMatrixCollision(newPiece)) {
			this.activePiece = newPiece;
			this.resetTickIfAboutToLock();
		}
	}

	hardDrop() {
		while (this.activePiece && !this.translateActivePiece(0, 1)) {}
		this.runPieceLockSequence();
	}

	hold() {
		if (this.holdAvailable && !this.gameOver) {
			if (this.holdPiece) {
				[this.activePiece, this.holdPiece] = [
					{
						...this.holdPiece,
						x: this.holdPiece.spawnX,
						y: this.holdPiece.spawnY,
						shape: this.holdPiece.originalShape,
					},
					{
						...this.activePiece,
						x: this.activePiece.spawnX,
						y: this.activePiece.spawnY,
						shape: this.activePiece.originalShape,
					},
				];
			} else {
				this.holdPiece = {
					...this.activePiece,
					x: this.activePiece.spawnX,
					y: this.activePiece.spawnY,
					shape: this.activePiece.originalShape,
				};
				this.spawnBlock();
			}
			this.holdAvailable = false;
			this.onCancelTick();
			this.onRequestTick(this.tickDelay);
		}
	}

	get ghostPiece() {
		if (!this.activePiece) return null;
		let ghostPiece = { ...this.activePiece };
		while (!this.checkMiniMatrixCollision(ghostPiece)) {
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
