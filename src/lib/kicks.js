export default { // tetrominoKicks[I][rot + CCW][test#]
	true: [ // IO Kicks
		[ [ 0, 0], [-2, 0], [+1, 0], [+1,-2], [-2,+1] ],
		[ [ 0, 0], [+2, 0], [-1, 0], [-1,-2], [+2,+1] ],
		[ [ 0, 0], [+2, 0], [-1, 0], [+2,-1], [-1,+2] ],
		[ [ 0, 0], [-1, 0], [+2, 0], [-1,-2], [+2,+1] ],
		[ [ 0, 0], [-2, 0], [+1, 0], [-2,-1], [+1,+1] ],
		[ [ 0, 0], [+2, 0], [-1, 0], [+2,-1], [-1,+1] ],
		[ [ 0, 0], [-2, 0], [+1, 0], [-2,-1], [+1,+2] ],
		[ [ 0, 0], [+1, 0], [-2, 0], [+1,-2], [-2,+1] ]
	],
	false: [ // JLSTZ Kicks
		[ [ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2] ],
		[ [ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2] ],
		[ [ 0, 0], [+1, 0], [+1,+1], [ 0,-2], [+1,-2] ],
		[ [ 0, 0], [+1, 0], [+1,+1], [ 0,-2], [+1,-2] ],
		[ [ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2] ],
		[ [ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2] ],
		[ [ 0, 0], [-1, 0], [-1,+1], [ 0,-2], [-1,-2] ],
		[ [ 0, 0], [-1, 0], [-1,+1], [ 0,-2], [-1,-2] ]
	]
};