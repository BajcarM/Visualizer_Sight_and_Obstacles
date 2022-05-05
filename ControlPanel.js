export default class ControlPanel {
  constructor(targetGameboard) {
    this.targetGameboard = targetGameboard;

    this.buttons = ["light", "wall", "clear"];
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
