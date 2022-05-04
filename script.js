// const plane = document.querySelector(".plane");

// let tilesArray = [];

// let rowsCount = 1;
// let colsCount = 1;

class Tile {
  constructor(id) {
    this.id = id;

    this.cornerTopL = { x: null, y: null };
    this.cornerTopR = { x: null, y: null };
    this.cornerBotL = { x: null, y: null };
    this.cornerBotR = { x: null, y: null };
    this.coordsCenter = { x: null, y: null };

    this.vectorU = { x: null, y: null };
    this.vectorV = { x: null, y: null };

    this.visible = true;
    this.opacity = null;

    this.player = false;
    this.wall = false;
  }

  getOwnCoords() {
    let tileRect = document
      .querySelector(`[data-id="${this.id}"]`)
      .getBoundingClientRect();

    this.cornerTopL = { x: tileRect.left, y: tileRect.top };
    this.cornerTopR = { x: tileRect.right, y: tileRect.top };
    this.cornerBotL = { x: tileRect.left, y: tileRect.bottom };
    this.cornerBotR = { x: tileRect.right, y: tileRect.bottom };
    this.coordsCenter = {
      x: tileRect.left + tileRect.width / 2,
      y: tileRect.top + tileRect.height / 2,
    };
  }

  getVisibleBorderVectors() {
    let vectorCorners = this.getVectorCorners();

    this.vectorU = {
      x: vectorCorners[0].x - tilePlayer.coordsCenter.x,
      y: vectorCorners[0].y - tilePlayer.coordsCenter.y,
    };

    this.vectorV = {
      x: vectorCorners[1].x - tilePlayer.coordsCenter.x,
      y: vectorCorners[1].y - tilePlayer.coordsCenter.y,
    };
  }

  getVectorCorners() {
    let tileCorners = [
      this.cornerTopL,
      this.cornerTopR,
      this.cornerBotL,
      this.cornerBotR,
    ];

    tileCorners = tileCorners.map((corner) => {
      return {
        x: corner.x,
        y: corner.y,
        distanceSquare: this.distanceSquare(corner, tilePlayer.coordsCenter),
      };
    });

    tileCorners.sort((a, b) => {
      return a.distanceSquare - b.distanceSquare;
    });

    let vectorCorners =
      tileCorners[0].distanceSquare === tileCorners[1].distanceSquare
        ? tileCorners.slice(0, 2)
        : tileCorners.slice(1, 3);

    return vectorCorners;
  }

  decideTileVisible(tileWall) {
    let tileCenterVector = {
      x: this.coordsCenter.x - tilePlayer.coordsCenter.x,
      y: this.coordsCenter.y - tilePlayer.coordsCenter.y,
    };
    let wallVisionAngle = this.angle(tileWall.vectorU, tileWall.vectorV);
    let tileCenterAngle = this.angle(tileWall.vectorU, tileCenterVector);

    if (
      (this.crossProduct(tileWall.vectorU, tileWall.vectorV) > 0 &&
        tileCenterAngle > 0 &&
        tileCenterAngle < wallVisionAngle) ||
      (this.crossProduct(tileWall.vectorU, tileWall.vectorV) < 0 &&
        tileCenterAngle < 0 &&
        tileCenterAngle > wallVisionAngle)
    ) {
      this.visible = false;
    }
  }

  distanceSquare(a, b) {
    return (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
  }

  crossProduct(u, v) {
    return u.x * v.y - u.y * v.x;
  }

  dotProduct(u, v) {
    return u.x * v.x + u.y * v.y;
  }

  angle(u, v) {
    return Math.atan2(Math.abs(this.crossProduct(u, v)), this.dotProduct(u, v));
  }
}

class Gameboard {
  constructor(rows, height) {
    this.rowsCount = rows;
    this.colsCount = 2 * rows;
    this.height = height;
    this.width = 2 * height;

    this.tilesArray = [];
    this.tilePlayer = null;
  }

  generateTiles() {
    for (let i = 0; i < this.rowsCount * this.colsCount; i++) {
      this.tilesArray.push(new Tile(i));
    }
  }

  displayTiles() {
    const plane = document.querySelector(".plane");
    const preparedTiles = this.tilesArray.map((tile) => {
      return `<div class="tile" data-id="${tile.id}"></div>`;
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

  gameboardAddListeners() {
    const buttons = document.querySelectorAll(".button");
    const icons = document.querySelectorAll(".icon");
    const tiles = document.querySelectorAll(".tile");

    let buttonPressed;

    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.currentTarget.classList.toggle("clicked");
        // e.currentTarget.firstElementChild.classList.toggle("move");
        console.log(e.target);
      });
    });

    // window.addEventListener("mousemove", (e) => {
    //   icons.forEach((icon) => {
    //     if (icon.classList.contains("move")) {
    //       icon.style.position = "absolute";
    //       icon.style.left = `${e.clientX}px`;
    //       icon.style.top = `${e.clientY}px`;
    //       icon.style.transform = "translate(-50%, -50%)";
    //       icon.style.cursor = "grab";
    //     } else {
    //       icon.style.position = "initial";
    //       icon.style.left = "initial";
    //       icon.style.top = "initial";
    //       icon.style.transform = "initial";
    //       icon.style.cursor = "initial";
    //     }
    //   });
    // });

    tiles.forEach((tile) => {
      tile.addEventListener("mouseover", (e) => {
        tiles.forEach((t) => {
          t.classList.remove("wall-mouse");
          t.classList.remove("light-mouse");
        });

        const buttonActive = document.querySelector(".clicked");
        if (buttonActive) {
          e.target.classList.add(`${buttonActive.dataset.id}-mouse`);
        }
        console.log(e.target);
      });
    });
  }
}

const gameboard = new Gameboard(2, 400);

gameboard.generateTiles();
gameboard.tilePlayer = gameboard.tilesArray[0];
gameboard.displayTiles();
gameboard.gameboardAddListeners();

// generateTiles(1, 3);
// let tilePlayer = tilesArray[0];

// displayTiles();
// tilesArray.forEach((tile) => {
//   tile.getOwnCoords();
//   tile.getVisibleBorderVectors();
//   tile.decideTileVisible(tilesArray[1]);
// });

console.log(gameboard.tilesArray);
