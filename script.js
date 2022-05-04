const plane = document.querySelector(".plane");

let tilesArray = [];
let tileSize = 200;

for (i = 0; i < 3; i++) {
  tilesArray.push({
    id: i,

    cornerTopL: { x: null, y: null },
    cornerTopR: { x: null, y: null },
    cornerBotL: { x: null, y: null },
    cornerBotR: { x: null, y: null },
    coordsCenter: { x: null, y: null },

    vectorU: { x: null, y: null },
    vectorV: { x: null, y: null },

    visible: true,
    opacity: null,

    player: false,
    wall: false,
  });
}

let tilePlayer = tilesArray[0];

function displayTiles() {
  const preparedTiles = tilesArray.map((tile) => {
    return `<div class="tile" data-id="${tile.id}"></div>`;
  });

  plane.innerHTML = preparedTiles.join("");
}

function getOwnCoords() {
  tilesArray.forEach((tile) => {
    let tileRect = document
      .querySelector(`[data-id="${tile.id}"]`)
      .getBoundingClientRect();

    tile.cornerTopL = { x: tileRect.left, y: tileRect.top };
    tile.cornerTopR = { x: tileRect.right, y: tileRect.top };
    tile.cornerBotL = { x: tileRect.left, y: tileRect.bottom };
    tile.cornerBotR = { x: tileRect.right, y: tileRect.bottom };
    tile.coordsCenter = {
      x: tileRect.left + tileRect.width / 2,
      y: tileRect.top + tileRect.height / 2,
    };
  });
}

function getVisibleBorderVectors(tile) {
  let vectorCorners = getVectorCorners();

  tile.vectorU = {
    x: vectorCorners[0].x - tilePlayer.coordsCenter.x,
    y: vectorCorners[0].y - tilePlayer.coordsCenter.y,
  };

  tile.vectorV = {
    x: vectorCorners[1].x - tilePlayer.coordsCenter.x,
    y: vectorCorners[1].y - tilePlayer.coordsCenter.y,
  };

  function getVectorCorners() {
    let tileCorners = [
      tile.cornerTopL,
      tile.cornerTopR,
      tile.cornerBotL,
      tile.cornerBotR,
    ];

    tileCorners = tileCorners.map((corner) => {
      return {
        x: corner.x,
        y: corner.y,
        distanceSquare: distanceSquare(corner, tilePlayer.coordsCenter),
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
}

function distanceSquare(a, b) {
  return (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
}

function crossProduct(u, v) {
  return u.x * v.y - u.y * v.x;
}

function dotProduct(u, v) {
  return u.x * v.x + u.y * v.y;
}

function angle(u, v) {
  Math.atan2(Math.abs(crossProduct(u, v)), dotProduct(u, v));
}

function decideTileVisible(tile, tileWall) {
  let tileCenterVector = {
    x: tile.coordsCenter.x - tilePlayer.coordsCenter.x,
    y: tile.coordsCenter.y - tilePlayer.coordsCenter.y,
  };
  let wallVisionAngle = angle(tileWall.vectorU, tileWall.vectorV);
  let tileCenterAngle = angle(tileWall.vectorU, tileCenterVector);

  if (
    (crossProduct(tileWall.vectorU, tileWall.vectorV) > 0 &&
      tileCenterAngle > 0 &&
      tileCenterAngle < wallVisionAngle) ||
    (crossProduct(tileWall.vectorU, tileWall.vectorV) < 0 &&
      tileCenterAngle < 0 &&
      tileCenterAngle > wallVisionAngle)
  ) {
    tile.visible = false;
  }
}

displayTiles();
getOwnCoords();
getVisibleBorderVectors(tilesArray[1]);
angle(tilesArray[1].vectorU, tilesArray[1].vectorV);
