const plane = document.querySelector(".plane");

let tilesArray = [];
let tileSize = 200;

tilesArray.push({
  id: 0,

  coordsTopL: null,
  coordsTopR: null,
  coordsBotL: null,
  coordsBotR: null,
  coordsCenter: null,

  vectorVisibleAngleU: null,
  vectorVisibleAngleV: null,

  visible: true,
  opacity: null,

  player: false,
  wall: false,
});
// tilesArray.push({
//   id: 1,
// });

function displayTiles() {
  const preparedTiles = tilesArray.map((tile) => {
    return `<div class="tile" data-id="${tile.id}"></div>`;
  });

  plane.innerHTML = preparedTiles.join("");
}

displayTiles();

function getOwnCoords() {
  tilesArray.forEach((tile) => {
    let tileRect = document
      .querySelector(`[data-id="${tile.id}"]`)
      .getBoundingClientRect();

    console.log(tileRect);

    tile.coordsTopL = [tileRect.left, tileRect.top];
    tile.coordsTopR = [tileRect.right, tileRect.top];
    tile.coordsBotL = [tileRect.left, tileRect.bottom];
    tile.coordsBotR = [tileRect.right, tileRect.bottom];
    tile.coordsCenter = [
      tileRect.left + tileRect.width / 2,
      tileRect.top + tileRect.height / 2,
    ];
  });
}



getOwnCoords();
console.log(tilesArray[0]);