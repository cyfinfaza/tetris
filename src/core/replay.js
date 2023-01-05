export default class {

	defaultConfig = {
		das: null,
		arr: null,
		sdf: null,

		boards: 1
	}
	constructor(config=this.defaultConfig) {
		this.pieceSet = []
	}

	keyframes = []

	addKeyframe(timestamp, boardIdx, command, params) {
		this.keyframes.push({
			timestamp,
			boardIdx,
			command,
			params
		});
	}

	blockEncoding = {
		'bracket': '[',
		'clearable-garbage': 'G',
		'invincible-garbage': 'X',
	}
	encodeBlock(name) {
		return this.blockEncoding[name] || name;
	};

	encodeBoard(board) {
		const height = board.length;
		const width = board[0].length;

		let output = ''
		let zeroRun = 0;
		let runType = 0;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const block = board[y][x]?.type || null;
				if (block === null) zeroRun++;
				else {
					if (zeroRun > 3) {
						output += `r${zeroRun}.`;
					} else if (zeroRun > 0) {
						output += '0'.repeat(zeroRun);
					}
					zeroRun = 0;
					output += this.encodeBlock(block);
				}
			}
		}

		console.log(output);
		return output;
	}

	gravity(ts, boardIdx, ms) { this.addKeyframe(ts, boardIdx, this.commands.gravity, [ms]) }
	move(ts, boardIdx, dx, dy) { this.addKeyframe(ts, boardIdx, this.commands.move, [dx, dy]) }
	rotate(ts, boardIdx, d) { this.addKeyframe(ts, boardIdx, this.commands.rotate, [d]) }
	rotateMove(ts, boardIdx, d, dx, dy) { this.addKeyframe(ts, boardIdx, this.commands.rotateMove, [d, dx, dy]) }
	spawnPiece(ts, boardIdx, x, y) { this.addKeyframe(ts, boardIdx, this.commands.spawnPiece, [x, y]) }

	queuePiece(ts, boardIdx, piece) {
		let idx = this.pieceSet.indexOf(piece);
		if (idx === -1) {
			idx = this.pieceSet.push(piece) - 1;
		}

		this.addKeyframe(ts, boardIdx, commands.queuePiece, [idx]);
	}

	level(ts, boardIdx, l) { this.addKeyframe(ts, boardIdx, this.commands.level, [l]) }
	levelLimit(ts, boardIdx, L) { this.addKeyframe(ts, boardIdx, this.commands.level, [L]) }
	countdown(ts, boardIdx, c) { this.addKeyframe(ts, boardIdx, this.commands.countdown, [c]) }
	setBoard(ts, boardIdx, board) { this.addKeyframe(ts, boardIdx, this.commands.setBoard, [this.encodeBoard(board)]) }
	pause(ts, boardIdx) { this.addKeyframe(ts, boardIdx, this.commands.pause, []) }
	achievement(ts, boardIdx, msg) { this.addKeyframe(ts, boardIdx, this.commands.achievement, [msg]) }
}