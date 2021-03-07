"use strict";

/*	=============
	Backend Code
	=============
*/

/* 
	Definitions;
	1. Number = operand = opr
	2. Operator = op
	3. Parenthesis = par
*/

/*
	Precedence table for operators.
	Higher the number, greater the precedence.
*/
const PRECEDENCE = {
	"^": 3,
	"/": 2,
	"*": 2,
	"+": 1,
	"-": 1
};

/* 
	Association table for operators.
	For explaination: https://en.wikipedia.org/wiki/Operator_associativity	
*/
const LEFT_ASSOCIATION = -1,
	RIGHT_ASSOCIATION = 1;
const ASSOCIATION = {
	"^": RIGHT_ASSOCIATION,
	"/": LEFT_ASSOCIATION,
	"*": LEFT_ASSOCIATION,
	"+": LEFT_ASSOCIATION,
	"-": LEFT_ASSOCIATION
};

const OP_REGEX = /[\+\-\*\/\^]/,
	PAR_REGEX = /[\(\)]/,
	/* Captures absolute values of numbers. */
	ABS_NUM_REGEX = /\d+\.?\d*/,
	/* 
		Captures actual values of numbers. 
		The pattern before the | is to capture the first digit's minus sign, if its negative, since it wont have any operators before its minus sign.
	*/
	NUM_REGEX = new RegExp(
		`^-?${ABS_NUM_REGEX.source}|(?<=${OP_REGEX.source}|${PAR_REGEX.source})-?${ABS_NUM_REGEX.source}`
	);

const tokenIsOpr = (token) => NUM_REGEX.test(token);
const tokenIsOp = (token) => OP_REGEX.test(token);

/* 
	Compares the precedence of two operators op1 and op2.
	Returns: 
		1 if op1 has higher precedence
		-1 if op2 has higher precedence
		0 if op1 and op2 have same precedence
*/
const comparePrecedence = (token, opStackTop) => {
	const comparison = PRECEDENCE[token] - PRECEDENCE[opStackTop];
	return Math.sign(comparison);
};

/* Perform the operator (op) on operand 1 (opr1) and operand 2 (opr2). */
const evaluate = (opr1, opr2, op) => {
	switch (op) {
		case "^":
			return opr1 ** opr2;
		case "/":
			return opr1 / opr2;
		case "*":
			return opr1 * opr2;
		case "+":
			return opr1 + opr2;
		case "-":
			return opr1 - opr2;
	}
};

/* Return an array of all operands, operators and parenthesis extracted from the input using a regex.*/
const parseInput = (input) =>
	input.match(
		new RegExp(
			`${NUM_REGEX.source}|${OP_REGEX.source}|${PAR_REGEX.source}`,
			"g"
		)
	);

/* Shunting Yard Algorithm. */
const parseInfix = (infix) => {
	let outStack = [],
		opStack = [];

	let i = 0;
	while (i < infix.length) {
		let token = infix[i];
		i++;

		if (tokenIsOpr(token)) {
			/* Operands are converted from strings to numbers, and directly pushed into outStack. */
			outStack.push(parseFloat(token));
		} else if (token === "(") {
			/* ")" is directly pushed into opStack. */
			opStack.push(token);
		} else if (token === ")") {
			/* 
				")" is not added to opStack.
				Pop all operators from opStack into outStack, until a "(" is found.
				"(" is to be discarded.
			*/
			let opStackTop = opStack.pop();
			while (opStackTop !== "(") {
				outStack.push(opStackTop);
				opStackTop = opStack.pop();
			}
		} else if (tokenIsOp(token)) {
			/* Compare the precedence of the operator (token) and opStackTop */
			let opStackTop = opStack[opStack.length - 1],
				precComparison = comparePrecedence(token, opStackTop);

			/* 
				Continously pop opStackTop into outStack only while:
					1. opStack has elements.
					2. opStackTop is not "(".
					3. opStackTop has higher precedence compared to token OR opStackTop and token have equal precedence, and token is left associative.
			*/
			while (
				opStack.length > 0 &&
				opStackTop !== "(" &&
				(precComparison === -1 ||
					(precComparison === 0 &&
						ASSOCIATION[token] === LEFT_ASSOCIATION))
			) {
				outStack.push(opStack.pop());

				opStackTop = opStack[opStack.length - 1];
				precComparison = comparePrecedence(token, opStackTop);
			}

			/* Finally push the token into opStack */
			opStack.push(token);
		}
	}

	/* Generate the final postfix by popping the contents of opStack into outStack */
	while (opStack.length > 0) {
		outStack.push(opStack.pop());
	}

	return outStack; // final postfix
};

const evalPostfix = (postfix) => {
	let workingStack = [],
		i = 0;
	while (i < postfix.length) {
		let token = postfix[i];
		i++;

		if (tokenIsOpr(token)) {
			/* Push operands into workingStack. */
			workingStack.push(token);
		} else if (tokenIsOp(token)) {
			/* 
			When an operator is found, pop out 2 operands (opr2, opr1) from workingStack, and evalute the 2 operands against the operator. 
			Push the result back into workingStack. 
			*/
			const opr2 = workingStack.pop(), // Operand 2 pops out first
				opr1 = workingStack.pop();
			const result = evaluate(opr1, opr2, token);
			workingStack.push(result);
		}
	}

	/* workingStack will finally have only 1 element, i.e. the final result. */
	return workingStack[0];
};

const evalInput = (input) => {
	const infix = parseInput(input);
	const postfix = parseInfix(infix);
	const result = evalPostfix(postfix);

	console.log("Infix: ", infix);
	console.log("Postfix: ", postfix);
	console.log("Result: ", result);

	return result;
};

/*	=============
	Frontend Code
	=============
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
