'use strict';

let move = 0;
let countClick = 0;
let flagFinish = false;

function game() {
    let board = document.getElementById('board');
    for (let i = 0; i < 9; i++) {
        let square = document.createElement('div');
        square.className = 'pole';
        board.append(square);
    }
}
let button = document.querySelector('.btn1');
button.addEventListener('click', newGame);
let mes = document.querySelector('.messages');

function message (text, category = "success") {
    let div = document.createElement('div');
    div.classList.add("message");
    div.classList.add(category);
    div.innerText = text;
    mes.append(div);
    setTimeout(() =>{
        div.remove();
    }, 2000);
}

function checkWinRow() {
    let flagFoundWinner;
    let p = document.querySelectorAll('.pole');
    for (let i = 0; i < 3; i++) {
        if (p[i * 3].textContent == "") {
            continue;
        }

        flagFoundWinner = true;
        for (let j = 0; j < 2; j++) {
            p[i * 3 + j];
            if (p[i * 3 + j].textContent != p[i * 3 + j + 1].textContent) {
                flagFoundWinner = false;
                break;
            }
        }

        if (flagFoundWinner) {
            return p[i * 3].textContent;
        }
    }
}

function checkWinColumn() {
    let flagFoundWinner;
    let p = document.querySelectorAll('.pole');
    for (let i = 0; i < 3; i++) {
        if (p[i].textContent == "") {
            continue;
        }

        flagFoundWinner = true;
        for (let j = 0; j < 2; j++) {
            p[j * 3 + i];
            if (p[j * 3 + i].textContent != p[(j + 1) * 3 + i].textContent) {
                flagFoundWinner = false;
                break;
            }
        }

        if (flagFoundWinner) {
            return p[i].textContent;
        }
    }
}

function checkWinMainDiagonal() {
    let flagFoundWinner;
    let p = document.querySelectorAll('.pole');
    if (p[0].textContent == "") {
        return;
    }

    flagFoundWinner = true;
    for (let j = 0; j < 2; j++) {
        if (p[j * 3 + j].textContent != p[(j + 1) * 3 + j + 1].textContent) {
            flagFoundWinner = false;
            return;
        }
    }

    if (flagFoundWinner) {
        return p[0].textContent;
    }
}

function checkWinAddDiagonal() {
    let flagFoundWinner;
    let p = document.querySelectorAll('.pole');

    if (p[3 - 1].textContent == "") {
        return;
    }

    flagFoundWinner = true;
    for (let j = 0; j < 2; j++) {
        if (p[j * 3 + 2 - j].textContent != p[(j + 1) * 3 + 2 - (j + 1)].textContent) {
            flagFoundWinner = false;
            return;
        }
    }

    if (flagFoundWinner) {
        return p[2].textContent;
    }
}

window.onload = game;
function click(event) {
    let winner;
    let targ = event.target;
    if (flagFinish) {
        message('Игра завершена!', "error");
        return;
    }
    if (targ.innerHTML !== '') {
        message('Поле уже занято', "error");
        return;
    }
    targ.textContent = move == 0 ? 'X' : 'O';
    countClick += 1;
    move = (move + 1) % 2;  

    winner = checkWinRow() || checkWinColumn() || checkWinMainDiagonal() || checkWinAddDiagonal();

    
    if (winner) {
        message("Победу одержали " + winner);
        flagFinish = true;
    } else if (countClick == 9) {
        message('Ничья');
        flagFinish = true;
    }
}


let board = document.getElementById('board');
board.addEventListener('click', click);

function newGame(event) {
    let p = document.querySelectorAll('.pole');
    for (let i = 0; i < 9; i++) {
        p[i].textContent = "";
    }
    move = 0;
    countClick = 0;
    flagFinish = false;
}
