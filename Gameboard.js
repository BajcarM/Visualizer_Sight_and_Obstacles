import Tile from "./Tile.js";

export default class Gameboard {
  constructor(rows, height) {
    this.rowsCount = rows;
    this.colsCount = 2 * rows;
    this.height = height;
    this.width = 2 * height;

    this.tilesArray = [];
    this.tilePlayer = null;

    for (let i = 0; i < this.rowsCount * this.colsCount; i++) {
      this.tilesArray.push(new Tile(i, this.colsCount));
    }
  }

  displayTiles() {
    const plane = document.querySelector(".plane");
    const preparedTiles = this.tilesArray.map((tile) => {
      return `<div class="tile empty" data-id="${tile.id}"></div>`;
    });

    plane.style.gridTemplateColumns = `repeat(${this.colsCount}, 1fr)`;
    plane.innerHTML = preparedTiles.join("");

    if (window.matchMedia("(max-height: 500px)").matches) {
      this.height = 350;
      this.width = 2 * this.height;
    }

    document.querySelectorAll(".tile").forEach((tile) => {
      tile.style.height = `${this.height / this.rowsCount}px`;
      tile.style.width = `${this.width / this.colsCount}px`;
    });

    this.tilesArray.forEach((tile) => {
      tile.getOwnCoords();
    });
  }

  displayVisibleTiles(tileLight) {
    const tiles = document.querySelectorAll(".tile");

    this.tilesArray.forEach((tile) => {
      tile.visible = true;
    });

    tiles.forEach((tile) => {
      if (!tile.classList.contains("tile-wall")) {
        tile.classList.add("visible");
      }
      tile.classList.remove("shadow");
    });

    const tilesWall = this.tilesArray.filter((tile) => {
      return tile.wall === true;
    });

    tilesWall.forEach((wall) => {
      wall.getVisibleBorderVectors(this.tilesArray[tileLight.dataset.id]);

      const tilesPotentialShadow = this.tilesArray.filter((tile) => {
        return tile.visible === true && tile.wall === false;
      });

      tilesPotentialShadow.forEach((tile) => {
        tile.decideTileVisible(this.tilesArray[tileLight.dataset.id], wall);

        if (tile.visible === false) {
          const tileShadow = document.querySelector(`[data-id="${tile.id}"]`);
          tileShadow.classList.remove("visible");
          tileShadow.classList.add("shadow");
        }
      });
    });
  }
}
