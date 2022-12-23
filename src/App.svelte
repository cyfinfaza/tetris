<script>
  import { onMount } from "svelte";

  let actualGrid = new Array(20);
  for (let i = 0; i < 20; i++) {
    actualGrid[i] = new Array(10);
    for (let j = 0; j < 10; j++) {
      actualGrid[i][j] = {
        block: false,
        falling: false,
        color: "#FFFFFF", // "#" + Math.floor(Math.random() * 16777215).toString(16),
        Text: i + " " + j,
      };
    }
  }

  function iterateAll(callback) {
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 10; j++) {
        callback(i, j);
      }
    }
  }

  function tick() {
    for (let i = 19; i >= 0; i--) {
      for (let j = 0; j < 10; j++) {
        if (
          actualGrid[i][j].falling &&
          (i >= 19 || actualGrid[i + 1][j]?.block)
        ) {
          iterateAll((i, j) => (actualGrid[i][j].falling = false));
          addBlock();
          return;
        }
      }
      for (let j = 0; j < 10; j++) {
        if (actualGrid[i][j].falling && actualGrid[i][j].block) {
          actualGrid[i + 1][j] = {
            falling: true,
            color: actualGrid[i][j].color,
            block: true,
          };
          actualGrid[i][j] = {
            falling: false,
            color: "#FFFFFF",
            block: false,
          };
        }
      }
    }
  }

  function addBlock() {
    actualGrid[0][0] = {
      falling: true,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      block: true,
    };
  }

  window.addBlock = addBlock;

  onMount(() => {
    setInterval(tick, 250);
  });
</script>

<main>
  <div class="grid">
    {#each actualGrid as row, i}
      {#each row as cell, j}
        <div style="background-color: {cell.color}" />
      {/each}
    {/each}
  </div>
</main>

<style>
  .grid {
    width: 300px;
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    background-color: #bbb;
    padding: 2px;
    gap: 2px;
  }
  .grid > div {
    width: 100%;
    aspect-ratio: 1;
  }
</style>
