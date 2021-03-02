"use strict";

/* 
	Definitions;
	1. Number = operand = opr
	2. Operator = op
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

const NUM_REGEX = /\d+\.?\d*/,
	OP_REGEX = /[\+\-\*\/\^]/,
	PAR_REGEX = /[\(\)]/;

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
	/* Convert operands from strings to integers. */
	opr1 = parseFloat(opr1);
	opr2 = parseFloat(opr2);

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

const parseInfix = (infix) => {
	let outStack = [],
		opStack = [];

	let i = 0;
	while (i < infix.length) {
		let token = infix[i];
		i++;

		if (tokenIsOpr(token)) {
			/* Operands are directly pushed into outStack. */
			outStack.push(token);
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

const main = () => {
	const input = document.getElementById("exp").value;
	const infix = parseInput(input);
	const postfix = parseInfix(infix);
	const result = evalPostfix(postfix);

	console.log("Infix: ", infix);
	console.log("Postfix: ", postfix);
	console.log("Result: ", result);
	document.getElementById("result").innerHTML = result;
};

document.getElementById("run").addEventListener("click", main);
