<script>
  import { onMount } from "svelte";
  import blocks from "./lib/blocks";

  const sx = 10;
  const sy = 25;
  const sy_v = 20;

  let actualGrid = new Array(sy);
  for (let i = 0; i < sy; i++) {
    actualGrid[i] = new Array(sx);
    for (let j = 0; j < sx; j++) {
      actualGrid[i][j] = {
        block: false,
        falling: false,
        color: "#FFFFFF", // "#" + Math.floor(Math.random() * 16777215).toString(16),
        Text: i + " " + j,
      };
    }
  }

  function iterateAll(callback) {
    for (let i = 0; i < sy; i++) {
      for (let j = 0; j < sx; j++) {
        callback(i, j);
      }
    }
  }

  function translate(axis, direction, collisionCallback = () => {}) {
    let fallingCount = 0;
    const v = (i, j) => [i, j][axis];
    for (let i = direction > 0 ? v(sy - 1, sx - 1) : 0; direction > 0 ? i >= 0 : i < v(sy, sx); i = i - direction) {
      // console.log(i);
      for (let j = 0; j < v(sx, sy); j++) {
        if (actualGrid[v(i, j)][v(j, i)].falling && ((direction > 0 ? i >= v(sy - 1, sx - 1) : i <= 0) || actualGrid[v(i + direction, j)][v(j, i + direction)]?.block)) {
          console.log("collision");
          collisionCallback();
          return -1;
        }
      }
      for (let j = 0; j < v(sx, sy); j++) {
        if (actualGrid[v(i, j)][v(j, i)].falling && actualGrid[v(i, j)][v(j, i)].block) {
          fallingCount++;
          actualGrid[v(i + direction, j)][v(j, i + direction)] = {
            falling: true,
            color: actualGrid[v(i, j)][v(j, i)].color,
            block: true,
          };
          actualGrid[v(i, j)][v(j, i)] = {
            falling: false,
            color: "#FFFFFF",
            block: false,
          };
        }
      }
    }
    return fallingCount;
  }

  let preQueue = null;
  $: console.log(preQueue);

  function addBlock() {
    // actualGrid[0][0] = {
    //   falling: true,
    //   color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    //   block: true,
    // };
    const chosenBlock = blocks[Math.floor(Math.random() * blocks.length)];
    console.log(chosenBlock);
    const offset = sy - sy_v;
    for (let i = 0; i < chosenBlock.shape.length; i++) {
      const row = [...new Array(chosenBlock.spawnX).fill(0), ...chosenBlock.shape[chosenBlock.shape.length - 1 - i], ...new Array(sx - chosenBlock.spawnX - chosenBlock.shape[chosenBlock.shape.length - 1 - i].length).fill(0)];
      console.log(row);
      for (let j = 0; j < sx; j++) {
        if (row[j] === 1) {
          const actualRow = offset - i;
          if (actualGrid[actualRow][j].block) {
            console.log("game over");
            return;
          } else {
            actualGrid[actualRow][j] = {
              falling: true,
              color: chosenBlock.color,
              block: true,
            };
          }
        }
      }
    }
  }

  function quickDrop() {
    let collision = false;
    for (let a = 0; a < sy && !collision; a++) {
      translate(0, 1, () => {
        iterateAll((i, j) => (actualGrid[i][j].falling = false));
        addBlock();
        collision = true;
      });
      // rotatePrequeue();
    }
  }

  window.addBlock = addBlock;
  window.actualGrid = actualGrid;

  function tick() {
    translate(0, 1, () => {
      iterateAll((i, j) => (actualGrid[i][j].falling = false));
      addBlock();
    });
  }

  onMount(() => {
    setInterval(tick, 1000);
    window.addEventListener("keydown", (e) => {
      // console.log(e);
      if (e.key == "ArrowRight") {
        translate(1, 1);
      } else if (e.key == "ArrowLeft") {
        translate(1, -1);
      } else if (e.key == "ArrowDown") {
        translate(0, 1);
      } else if (e.key == " ") {
        quickDrop();
      }
    });
    addBlock();
  });
</script>

<main>
  <div class="grid">
    {#each actualGrid.slice(sy - sy_v) as row, i}
      {#each row as cell, j}
        <div style="background-color: {cell.color}">
          <!-- {i},{j} -->
        </div>
      {/each}
    {/each}
  </div>
</main>

<style>
  .grid {
    height: 90vh;
    aspect-ratio: 10/20;
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    /* grid-template-rows: repeat(sy, 1fr); */
    background-color: #bbb;
    padding: 2px;
    /* gap: 2px; */
    box-sizing: border-box;
  }
  .grid > div {
    height: 100%;
    aspect-ratio: 1;
  }
</style>
