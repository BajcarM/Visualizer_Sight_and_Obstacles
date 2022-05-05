class Tile {
  constructor(id, colsCount) {
    this.id = id;
    this.colsCount = colsCount;

    this.cornerTopL = { x: null, y: null };
    this.cornerTopR = { x: null, y: null };
    this.cornerBotL = { x: null, y: null };
    this.cornerBotR = { x: null, y: null };
    this.coordsCenter = { x: null, y: null };

    this.vectorU = { x: null, y: null };
    this.vectorV = { x: null, y: null };

    this.visible = true;
    this.opacity = null;

    this.light = false;
    this.wall = false;
  }

  getOwnCoords() {
    let tileRect = document
      .querySelector(`[data-id="${this.id}"]`)
      .getBoundingClientRect();

    //   ADDED + 1 PX TO CORNERS SO THEY OVERLAP A BIT AND YOU CANNOT SEE THROUGH CORNER CONNECTED TILES

    this.cornerTopL = { x: tileRect.left - 1, y: tileRect.top - 1 };
    this.cornerTopR = { x: tileRect.right + 1, y: tileRect.top - 1 };
    this.cornerBotL = { x: tileRect.left - 1, y: tileRect.bottom + 1 };
    this.cornerBotR = { x: tileRect.right + 1, y: tileRect.bottom + 1 };
    this.coordsCenter = {
      x: tileRect.left + tileRect.width / 2,
      y: tileRect.top + tileRect.height / 2,
    };
  }

  getVisibleBorderVectors(tileLight) {
    let vectorCorners = this.getVectorCorners(tileLight);

    this.vectorU = {
      x: vectorCorners[0].x - tileLight.coordsCenter.x,
      y: vectorCorners[0].y - tileLight.coordsCenter.y,
    };

    this.vectorV = {
      x: vectorCorners[1].x - tileLight.coordsCenter.x,
      y: vectorCorners[1].y - tileLight.coordsCenter.y,
    };
  }

  getVectorCorners(tile) {
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
        distanceSquare: this.distanceSquare(corner, tile.coordsCenter),
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

  decideTileVisible(tileLight, tileWall) {
    let tileCenterVector = {
      x: this.coordsCenter.x - tileLight.coordsCenter.x,
      y: this.coordsCenter.y - tileLight.coordsCenter.y,
    };
    let wallVisionAngle = this.angle(tileWall.vectorU, tileWall.vectorV);
    let tileCenterAngle = this.angle(tileWall.vectorU, tileCenterVector);

    if (
      this.crossProduct(tileWall.vectorU, tileWall.vectorV) *
        this.crossProduct(tileWall.vectorU, tileCenterVector) >
        0 &&
      tileCenterAngle < wallVisionAngle
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
        return (
          tile.distanceSquare(
            this.tilesArray[tileLight.dataset.id].coordsCenter,
            tile.coordsCenter
          ) >
            tile.distanceSquare(
              this.tilesArray[tileLight.dataset.id].coordsCenter,
              wall.coordsCenter
            ) &&
          tile.visible === true &&
          tile.wall === false
        );
      });

      tilesPotentialShadow.forEach((tile) => {
        tile.decideTileVisible(this.tilesArray[tileLight.dataset.id], wall);
        const tileShadow = document.querySelector(`[data-id="${tile.id}"]`);
        if (tile.visible === false) {
          tileShadow.classList.remove("visible");
          tileShadow.classList.add("shadow");
        }

        opacity(tile);
        tileShadow.style.opacity = `${tile.opacity}%`;

        function opacity(t) {
          console.log(t.id);
          let tilesAround = [
            this.tilesArray[t.id - (this.colsCount + 1)],
            this.tilesArray[t.id - this.colsCount],
            this.tilesArray[t.id - (this.colsCount - 1)],
            this.tilesArray[t.id - 1],
            this.tilesArray[t.id + 1],
            this.tilesArray[t.id + (this.colsCount - 1)],
            this.tilesArray[t.id + this.colsCount],
            this.tilesArray[t.id + (this.colsCount + 1)],
          ];
          return (t.opacity = tilesAround.reduce((acc, tile) => {
            if (tile.visible) {
              (acc += 12), 5;
            }
            return acc;
          }, 0));
        }
      });
    });
  }
}

class ControlPanel {
  constructor(targetGameboard) {
    this.targetGameboard = targetGameboard;

    this.buttons = ["light", "wall", "smooth", "clear"];
  }

  displayControls() {
    const controlsContainer = document.querySelector(".controls-container");
    const buttonsHTML = this.buttons.map((button) => {
      return `
            <button type="button" class="button button-${button}" data-id="${button}">
                <div class="icon icon-${button}" data-id="icon-${button}"></div>
                ${button}
            </button>
          `;
    });
    controlsContainer.style.gridTemplateColumns = `repeat(${this.buttons.length}, 1fr)`;
    controlsContainer.innerHTML = buttonsHTML.join("");
  }

  addClickListeners() {
    const buttons = document.querySelectorAll(".button");
    const tiles = document.querySelectorAll(".tile");
    const body = document.querySelector("body");

    function removeClickedFromAll() {
      buttons.forEach((button) => {
        button.classList.remove("clicked");
      });
      body.className = "";
      tiles.forEach((t) => {
        t.classList.remove("wall-mouse");
        t.classList.remove("light-mouse");
      });
    }

    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        if (e.currentTarget.dataset.id === "clear") {
          removeClickedFromAll();
          tiles.forEach((tile) => {
            tile.className = "tile empty";
          });
          this.targetGameboard.tilesArray.forEach((tile) => {
            tile.visible = true;
            tile.opacity = null;
            tile.light = false;
            tile.wall = false;
          });
        } else if (e.currentTarget.dataset.id === "smooth") {
          // HERE GOES FUNCTION XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

          console.log("SMOOTH");
        } else if (e.currentTarget.classList.contains("clicked")) {
          removeClickedFromAll();
        } else {
          removeClickedFromAll();
          e.currentTarget.classList.add("clicked");
          body.classList.add(`cursor-${e.currentTarget.dataset.id}`);
        }
      });
    });

    tiles.forEach((tile) => {
      tile.addEventListener("click", (e) => {
        const buttonActive = document.querySelector(".clicked");
        const tileSelected =
          this.targetGameboard.tilesArray[e.target.dataset.id];
        const buttonLight = document.querySelector(".button-light");
        let tileLight = document.querySelector(".tile-light");

        if (
          e.target.classList.contains("tile-light") &&
          (!buttonActive || buttonLight.classList.contains("clicked"))
        ) {
          removeClickedFromAll();
          buttonLight.classList.add("clicked");
          body.classList.add(`cursor-${buttonLight.dataset.id}`);

          tileSelected.light = false;

          tileLight.classList.add("empty");
          tileLight.classList.remove("tile-light");

          tiles.forEach((tile) => {
            if (!tile.classList.contains("tile-wall")) {
              tile.classList.remove("visible");
            }
            tile.classList.remove("shadow");
          });
          return;
        }

        if (!buttonActive) {
          return;
        }

        if (
          e.target.classList.contains("empty") &&
          buttonActive.dataset.id === "wall"
        ) {
          e.target.classList.remove("empty");
          e.target.classList.remove("visible");
          e.target.classList.add("tile-wall");

          tileSelected.wall = true;

          if (tileLight) {
            this.targetGameboard.displayVisibleTiles(tileLight);
          }
        }

        if (
          e.target.classList.contains("empty") &&
          buttonActive.dataset.id === "light"
        ) {
          if (tileLight) {
            tileLight.classList.remove("tile-light");
            tileLight.classList.add("empty");

            this.targetGameboard.tilesArray[tileLight.dataset.id].light = false;
          }

          e.target.classList.remove("empty");
          e.target.classList.add("tile-light");
          tileLight = document.querySelector(".tile-light");

          this.targetGameboard.tilesArray[tileLight.dataset.id].light = true;
          this.targetGameboard.displayVisibleTiles(tileLight);
        }
      });
    });
  }

  addMouseListeners() {
    const tiles = document.querySelectorAll(".tile");
    const plane = document.querySelector(".plane");
    const body = document.querySelector("body");
    let mouseIsDown = false;

    tiles.forEach((tile) => {
      tile.addEventListener("mouseover", (e) => {
        let tileLight = document.querySelector(".tile-light");
        const tileSelected =
          this.targetGameboard.tilesArray[e.target.dataset.id];
        const buttonActive = document.querySelector(".clicked");

        if (!buttonActive) {
          return;
        }
        if (
          document.querySelector(".tile-light") &&
          buttonActive.dataset.id === "light"
        ) {
          return;
        }

        if (e.target.classList.contains("empty")) {
          e.target.classList.add(`${buttonActive.dataset.id}-mouse`);
        }

        if (
          e.target.classList.contains("empty") &&
          mouseIsDown &&
          buttonActive.dataset.id === "wall"
        ) {
          e.target.classList.remove("empty");
          e.target.classList.remove("visible");
          e.target.classList.add("tile-wall");

          tileSelected.wall = true;

          if (tileLight) {
            this.targetGameboard.displayVisibleTiles(tileLight);
          }
        }
      });

      tile.addEventListener("mouseout", (e) => {
        e.target.classList.remove("wall-mouse");
        e.target.classList.remove("light-mouse");
      });
    });

    plane.addEventListener("mousedown", (e) => {
      e.preventDefault();
      let tileLight = document.querySelector(".tile-light");
      const tileSelected = this.targetGameboard.tilesArray[e.target.dataset.id];
      const buttonActive = document.querySelector(".clicked");

      mouseIsDown = true;

      if (
        e.target.classList.contains("empty") &&
        buttonActive &&
        buttonActive.dataset.id === "wall"
      ) {
        e.target.classList.remove("empty");
        e.target.classList.remove("visible");
        e.target.classList.add("tile-wall");

        tileSelected.wall = true;

        if (tileLight) {
          this.targetGameboard.displayVisibleTiles(tileLight);
        }
      }
    });

    body.addEventListener("mouseup", () => {
      mouseIsDown = false;
    });
  }
}

const gameboard = new Gameboard(50, 700);
const controlPanel = new ControlPanel(gameboard);

gameboard.generateTiles();

gameboard.displayTiles();
controlPanel.displayControls();
controlPanel.addClickListeners();
controlPanel.addMouseListeners();
