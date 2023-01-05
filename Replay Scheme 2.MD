# REPLAY FILE SCHEME DRAFT 2

| Symbol          | Effect      |
| ---------       | -------     |
| [i]:[t]:[s]{:s} | Keyframe    |
| G[x]            | Gravity     |
| M[x],[y]        | Move        |
| r[d]            | Rotate      |
| R[d],[x],[y]    | Rotate      |
| S[x],[y]        | Spawn peice |
| Q[id]           | Queue piece |
| l[x]            | Level       |
| L[x]            | Level limit |
| C[x]            | Countdown   |
| B[w],[h],[b]    | Set Board   |
| P               | Pause       |
| A[string]       | Achievement |

| Symbol        | Board       |
| ---------     | -------     |
| JSTLZIOG[X0   | Piece       |
| r[x].         | x Run of 0s |

```
file = {
	info: {
		version: number

		mode: string
		finalTime: number,
		flags: [string];

		das: number
		arr: number
		sdf: number

		initalState: {
			pieces: [[char]]
			board: string

		}
	}

	keyframes: str
}



magic meta board startGame { keyframe } endGame CRC32

meta = version info stats
info = das arr sdf
stats = score totalTime flags

board = width height row*height
row = block*width
block = typeof(uint8)
width, height = typeof(uint16)

version, das, arr, sdf = typeof(uint16)
score, totalTime = typeof(uint64)
flags = typeof(uint128)

keyframe = timestamp (pause | move amt | drop amt | setBoard row*height)
timestamp = typeof(uint32)
amt = typeof(uint8)

magic = 0x53746759
startGame = 0x80
startGame = 0x00
pause = 0x81
move = 0x82
drop = 0x83
```