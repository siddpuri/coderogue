import Display from "./display.js";
import Updater from "./updater.js";

let display;
let updater;

window.onload = async function() {
    display = new Display();
    updater = new Updater();
    display.showLoadingScreen();
}