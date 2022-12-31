export default [
	{
		appliesTo: ["I", "O"],
		kicks: [
			[
				[],
				[[ 0, 0], [+1, 0], [-2, 0], [-2,+1], [+1,-2]], // 0 -> 1
				[[ 0, 0], [ 0,-1], [+1,-1], [-1,-1], [+1, 0], [-1, 0]], // 0 -> 2
				[[ 0, 0], [-1, 0], [+2, 0], [+2,+1], [-1,-2]], // 0 -> 3
			],
			[
				[[ 0, 0], [-1, 0], [+2, 0], [-1,+2], [+2,-1]], // 1 -> 0
				[],
				[[ 0, 0], [-1, 0], [+2, 0], [-1,-2], [+2,+1]], // 1 -> 2
				[[0, 0], [+1, 0], [+1,-2], [+1,-1], [ 0,-2], [ 0,-1]], // 1 -> 3
			],
			[
				[[0, 0], [ 0,+1], [-1,+1], [+1,+1], [-1, 0], [ 1, 0]], // 2 -> 0
				[[ 0, 0], [-2, 0], [+1, 0], [-2,-1], [+1,+2]], // 2 -> 1
				[],
				[[ 0, 0], [+2, 0], [-1, 0], [+2,-1], [-1,+2]], // 2 -> 3
			],
			[
				[[ 0, 0], [+1, 0], [-2, 0], [+1,+2], [-2,-1]], // 3 -> 0
				[[0, 0], [-1, 0], [-1,-2], [-1,-1], [ 0,-2], [ 0,-1]], // 3 -> 1
				[[ 0, 0], [+1, 0], [-2, 0], [+1,-2], [-2,+1]], // 3 -> 2
				[],
			],
		]
	},
	{
		appliesTo: ["J", "L", "S", "T", "Z"],
		kicks: [
			[
				[],
				[[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]], // 0 -> 1
				[[ 0, 0], [ 0,-1], [+1,-1], [-1,-1], [+1, 0], [-1, 0]], // 0 -> 2
				[[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]], // 0 -> 3
			],
			[
				[[ 0, 0], [+1, 0], [+1,+1], [ 0,-2], [+1,-2]], // 1 -> 0
				[],
				[[ 0, 0], [+1, 0], [+1,+1], [ 0,-2], [+1,-2]], // 1 -> 2
				[[0, 0], [+1, 0], [+1,-2], [+1,-1], [ 0,-2], [ 0,-1]], // 1 -> 3
			],
			[
				[[0, 0], [ 0,+1], [-1,+1], [+1,+1], [-1, 0], [ 1, 0]], // 2 -> 0
				[[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]], // 2 -> 1
				[],
				[[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]], // 2 -> 3
			],
			[
				[[ 0, 0], [-1, 0], [-1,+1], [ 0,-2], [-1,-2]], // 3 -> 0
				[[0, 0], [-1, 0], [-1,-2], [-1,-1], [ 0,-2], [ 0,-1]], // 3 -> 1
				[[ 0, 0], [-1, 0], [-1,+1], [ 0,-2], [-1,-2]], // 3 -> 2
				[],
			],
		]
	}
]

// // ALL PIECES [180]

// /* 0->2 */ [[0, 0], [ 0,-1], [+1,-1], [-1,-1], [+1, 0], [-1, 0]]
// /* 2->0 */ [[0, 0], [ 0,+1], [-1,+1], [+1,+1], [-1, 0], [ 1, 0]]
// /* 1->3 */ [[0, 0], [+1, 0], [+1,-2], [+1,-1], [ 0,-2], [ 0,-1]]
// /* 3->1 */ [[0, 0], [-1, 0], [-1,-2], [-1,-1], [ 0,-2], [ 0,-1]]

// // MOST PIECES

// /* 0->1 */ [[ 0, 0], [-1, 0], [-1,+1], [ 0,-2], [-1,-2]],
// /* 1->0 */ [[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]],

// /* 1->2 */ [[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]],
// /* 2->1 */ [[ 0, 0], [-1, 0], [-1,+1], [ 0,-2], [-1,-2]],

// /* 2->3 */ [[ 0, 0], [+1, 0], [+1,+1], [ 0,-2], [+1,-2]],
// /* 3->2 */ [[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]],

// /* 3->0 */ [[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]],
// /* 0->3 */ [[ 0, 0], [+1, 0], [+1,+1], [ 0,-2], [+1,-2]],


// // I PIECE

// /* 0->1 */ [[ 0, 0], [-2, 0], [+1, 0], [-2,-1], [+1,+2]],
// /* 1->0 */ [[ 0, 0], [+2, 0], [-1, 0], [+2,+1], [-1,-2]],

// /* 1->2 */ [[ 0, 0], [-1, 0], [+2, 0], [-1,+2], [+2,-1]],
// /* 2->1 */ [[ 0, 0], [+1, 0], [-2, 0], [+1,-2], [-2,+1]],

// /* 2->3 */ [[ 0, 0], [+2, 0], [-1, 0], [+2,+1], [-1,-2]],
// /* 3->2 */ [[ 0, 0], [-2, 0], [+1, 0], [-2,-1], [+1,+2]],

// /* 3->0 */ [[ 0, 0], [+1, 0], [-2, 0], [+1,-2], [-2,+1]],
// /* 0->3 */ [[ 0, 0], [-1, 0], [+2, 0], [-1,+2], [+2,-1]],