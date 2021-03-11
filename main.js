import { evalInput } from "./logic.js";

/* 
	This module handles the calculator UI's keys and display.
	It also calls evalInput from logic.js to evaluate the expression entered into the calculator UI.
*/

const INPUT_KEYS = document.querySelectorAll(".js-input"),
	BKSP_KEY = document.querySelector(".js-bksp"),
	C_KEY = document.querySelector(".js-c"),
	EVAL_KEY = document.querySelector(".js-eval"),
	EXP_DISPLAY = document.querySelector(".exp"),
	RES_DISPLAY = document.querySelector(".res");

let inputToEval = "",
	inputToDisplay = "",
	result = 0;

/* Updates EXP_DISPLAY with text. */
const updateExpDisplay = (text) => {
	EXP_DISPLAY.innerHTML = text;
};

/* Updates RES_DISPLAY with text. */
const updateResDisplay = (text) => {
	RES_DISPLAY.innerHTML = text;
};

/* 
	Resets the entire calculator display by: 
	1. Clearing EXP_DISPLAY, or setting it to an inital value.
	2. Clearing RES_DISPLAY, by calling resetResDisplay().
*/
const resetDisplay = (initial = "") => {
	inputToEval = initial;
	inputToDisplay = initial;
	updateExpDisplay(inputToDisplay);
	resetResDisplay();
};

/* Clears RES_DISPLAY. */
const resetResDisplay = () => {
	updateResDisplay("");
	undoTrans();
};

/* Triggers the font-size transition by add to classLists. */
const trigTrans = () => {
	EXP_DISPLAY.classList.add("exp-trns");
	RES_DISPLAY.classList.add("res-trns");
};

/* Undoes the font-size transition by removing from classLists. */
const undoTrans = () => {
	EXP_DISPLAY.classList.remove("exp-trns");
	RES_DISPLAY.classList.remove("res-trns");
};

/* 
	Append the value attribute of the pressed key into inputToEval.
	Append the text of the pressed key into inputToDisplay.
	
	If RES_DISPLAY has any text inside it, reset the entire calculator display with the result being shown by RES_DISPLAY.
	This allows the user to re-use the result they had last calculated.
*/
const inputKeyPress = function () {
	if (RES_DISPLAY.innerText) resetDisplay(result);

	inputToEval += this.getAttribute("value");
	inputToDisplay += this.innerText;
	updateExpDisplay(inputToDisplay);
};

/* 
	Remove the last character from inputToEval and inputToDisplay.
	
	If RES_DISPLAY has any text inside it, reset the result display.
	This hides the result while the user edits the entered expression.
*/
const bkspKeyPress = () => {
	if (RES_DISPLAY.innerText) resetResDisplay();

	inputToEval = inputToEval.slice(0, -1);
	inputToDisplay = inputToDisplay.slice(0, -1);
	updateExpDisplay(inputToDisplay);
};

/* 
	Evaluate inputToEval using the Backend Code.
	The result is rounded to have a maxmimum of 8 digits after the decimal point.
*/
const evalKeyPress = function () {
	result = evalInput(inputToEval);
	result = Math.round((result + Number.EPSILON) * 10e8) / 10e8;
	updateResDisplay(result);
	trigTrans();
};

/* Click-Event Listeners. */
INPUT_KEYS.forEach((key) => key.addEventListener("click", inputKeyPress));
BKSP_KEY.addEventListener("click", bkspKeyPress);
C_KEY.addEventListener("click", () => resetDisplay());
EVAL_KEY.addEventListener("click", evalKeyPress);
