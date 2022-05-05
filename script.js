import ControlPanel from "./ControlPanel.js";
import Gameboard from "./Gameboard.js";

const gameboard = new Gameboard(50, 700);
const controlPanel = new ControlPanel(gameboard);



gameboard.displayTiles();
controlPanel.displayControls();
controlPanel.addClickListeners();
controlPanel.addMouseListeners();
