# REPLAY FILE SCHEME DRAFT 1

`file = magic meta board startGame { keyframe } endGame CRC32`

`meta = version info stats`
`info = das arr sdf`
`stats = score totalTime flags`

`board = width height row*height`
`row = block*width`
`block = typeof(uint8)`
`width, height = typeof(uint16)`

`version, das, arr, sdf = typeof(uint16)`
`score, totalTime = typeof(uint64)`
`flags = typeof(uint128)`

`keyframe = timestamp (pause | move amt | drop amt | setBoard row*height)`
`timestamp = typeof(uint32)`
`amt = typeof(uint8)`

`magic = 0x53746759`
`startGame = 0x80`
`startGame = 0x00`
`pause = 0x81`
`move = 0x82`
`drop = 0x83`
