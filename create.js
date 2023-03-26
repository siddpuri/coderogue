const prompt = require("prompt-sync")({ sigint: true });

function inputWithLowerBound(text, bound) {
    let x;
    for (x = prompt(text); x <= bound; x = prompt(text)) console.log('Input must be non-zero');
    return x;
}

let n = inputWithLowerBound('How many numbers would you like to give me? ', 2);
let numbers = [];
for (let i = 0; i < n; i++) numbers.push(inputWithLowerBound('What is number #' + i + '? ', 0));
for (number of numbers) console.log(number + ' is ' + (number % 2? 'odd' : 'even'));
