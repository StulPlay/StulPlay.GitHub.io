// Обработчик события загрузки страницы
window.onload = function () {
    // Назначение обработчика события click на все кнопки
    var buttons = document.getElementsByTagName('button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
            clickedButton = this.id;
            click();
        });
    }
}



// Функция для преобразования инфиксной записи в обратную польскую нотацию (ОПН)
function convertToRPN(infix) {
    var outputQueue = [];
    var operatorStack = [];

    var operators = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        '^': 3
    };

    infix = infix.replace(/\s+/g, ''); // Убираем пробелы

    var currentNumber = '';

    // Проходим по каждому символу в инфиксной записи
    for (var i = 0; i < infix.length; i++) {
        var token = infix[i];

        // Если текущий символ - число или точка, добавляем его к текущему числу
        if (!isNaN(parseFloat(token)) || token === '.') {
            currentNumber += token;
        } else {
            // Если текущее число не пусто, добавляем его в очередь вывода
            if (currentNumber !== '') {
                outputQueue.push(currentNumber);
                currentNumber = '';
            }

            // Обработка операторов и скобок
            if (token in operators) {
                while (
                    operatorStack.length &&
                    operators[operatorStack[operatorStack.length - 1]] >= operators[token]
                ) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            } else if (token === '(') {
                operatorStack.push(token);
            } else if (token === ')') {
                while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.pop(); // Удаляем открывающую скобку
            }
        }
    }

    // Если текущее число не пусто после завершения цикла, добавляем его в очередь вывода
    if (currentNumber !== '') {
        outputQueue.push(currentNumber);
    }

    // Добавляем оставшиеся операторы из стека в очередь вывода
    while (operatorStack.length) {
        outputQueue.push(operatorStack.pop());
    }

    return outputQueue;
}

// Функция для вычисления выражения, представленного в обратной польской нотации (ОПН)
function evaluateRPN(rpnArray) {
    var stack = [];

    // Проходим по каждому элементу в обратной польской нотации
    for (var i = 0; i < rpnArray.length; i++) {
        var token = rpnArray[i];

        // Если текущий элемент - число или точка, добавляем его в стек
        if (!isNaN(parseFloat(token)) || token === '.') {
            stack.push(token);
        } else {
            // Если текущий элемент - оператор, выполняем соответствующую операцию
            var operand2 = stack.pop();
            var operand1 = stack.pop();

            switch (token) {
                case '+':
                    stack.push(parseFloat(operand1) + parseFloat(operand2));
                    break;
                case '-':
                    stack.push(parseFloat(operand1) - parseFloat(operand2));
                    break;
                case '*':
                    stack.push(parseFloat(operand1) * parseFloat(operand2));
                    break;
                case '/':
                    stack.push(parseFloat(operand1) / parseFloat(operand2));
                    break;
                case '^':
                    stack.push(Math.pow(parseFloat(operand1), parseFloat(operand2)));
                    break;
            }
        }
    }

    return stack[0];
}

// Обработчик события click на кнопках
function click(){
    // Если нажата кнопка "clear", установить содержимое inputField в '0'
    if(clickedButton === 'clear')
        document.getElementById('inputField').innerHTML = '0';
    // Если нажата кнопка арифметической операции, добавить соответствующий символ в inputField
    else if (clickedButton === 'divi' || clickedButton === 'multi' || clickedButton === 'sub' || clickedButton === 'dot' || clickedButton === 'add'){ 
        // Если в inputField уже отображается 'Error', вызвать функцию clear
        if(document.getElementById('inputField').innerHTML === 'Error')
            clear();
        // Добавить символ арифметической операции к текущему содержимому inputField
        document.getElementById('inputField').innerHTML += document.getElementById(clickedButton).innerHTML;
        // Установить equationDone в false, так как ввод ещё не завершён
        equationDone = false;
    }    
    // Если нажата кнопка "equal"
    else if (clickedButton === 'equal'){        
        // Получить текущее содержимое inputField
        var equation = document.getElementById('inputField').innerHTML;        
        var answer;
        
        // Попытаться вычислить значение выражения в inputField
        try {
            answer = evaluateRPN(convertToRPN(equation));
        } catch (e) {
            // Если возникла ошибка (например, синтаксическая ошибка), установить содержимое inputField в 'Error'
            if (e instanceof SyntaxError) {
                document.getElementById('inputField').innerHTML = 'Error';
            }
        }       
        
        // Если результат равен 'Infinity', установить содержимое inputField в 'Error'
        if(answer == 'Infinity')
            document.getElementById('inputField').innerHTML = 'Error';  
        // Если результат - целое число, отобразить его без округления до двух знаков после запятой
        else if(Number.isInteger(answer))
            document.getElementById('inputField').innerHTML = answer;               
        // В противном случае отобразить результат с округлением до двух знаков после запятой
        else
            document.getElementById('inputField').innerHTML = answer.toFixed(2);   
        
        // Установить equationDone в true, так как вычисление завершено
        equationDone = true;
    }
    // Если нажата любая другая кнопка
    else{       
        // Вызвать функцию clear для очистки inputField, затем добавить символ кнопки к inputField
        clear();
        document.getElementById('inputField').innerHTML += document.getElementById(clickedButton).innerHTML;        
    }        
}

// Функция для очистки inputField
function clear(){    
    // Если текущее содержимое inputField равно '0', equationDone равно true, или содержимое inputField равно 'Error', очистить inputField
    if(document.getElementById('inputField').innerHTML === '0' || equationDone === true || document.getElementById('inputField').innerHTML === 'Error')  
        document.getElementById('inputField').innerHTML = '';
    
    equationDone = false;
}
