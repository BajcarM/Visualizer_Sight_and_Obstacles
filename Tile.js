export default class Tile {
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
