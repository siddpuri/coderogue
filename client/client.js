import Display from './display.js';
import Updater from './updater.js';

let display;
let updater;

window.onload = async function() {
    const baseUrl = window.location.origin;
    display = new Display();
    updater = new Updater(baseUrl, display);
    display.showLoadingScreen();
    updater.start();
}