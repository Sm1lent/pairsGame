

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.querySelector('.btn-start');
    const input =  document.querySelector('.input');
    const block =  document.querySelector('.play_board');
    const countBlock = document.querySelector('.countdown');
    const shownBlocks = document.querySelectorAll('.absolute_block');
    let start;

    startButton.addEventListener('click', (e) => {
        e.preventDefault();
        let rowsNumber = input.value;
        if ((rowsNumber%2 === 1)||(2 > rowsNumber)||(rowsNumber > 10)||(rowsNumber === '')) {
            rowsNumber = 4;
        }
        block.innerHTML = null;

        function changeBlock(){
            startButton.classList.toggle('display-none');
            shownBlocks.forEach(function(swapBlocks) {
                swapBlocks.classList.toggle('hidden');
            });
        };

        function configPlayground (rowsNumber) {
            let field;

            switch (rowsNumber){
             case '2':   field = "190px";
             break;
             case '4':   field = "250px";
             break;
             case 4:   field = "250px";
             break;
             case '6':   field = "350px";
             break;
             case '8':   field = "340px";
             break;
             case '10':   field = "420px";
             break;
            }
            block.style.width = field;
         };

        function mixPositions (rowsNumber) {
            let cardsNumber = rowsNumber**2;
            let mix = [];

            // создаём индексы, содержимое карточек и перемешиваем
            let i= 0;
            for (let j=0;  j < cardsNumber; j = j +2) {
                i++;
                mix[j] = {position: Math.floor(Math.random() * 1000000), value: i};
                mix[j+1] = {position:  Math.floor(Math.random() * 1000000), value: i}
            }

            mix.sort(function (a, b) {
                if (a.position > b.position) {
                return 1;
                }
                if (a.position < b.position) {
                return -1;
                }
                return 0;
            });
            return mix;
        };

        function createCard (rowsNumber) {
            let card = document.createElement('div');
            let  secondClass = 'card-4to6';
            switch (rowsNumber) {
                case '2':   secondClass = 'card-2';
                break;
                case '6':   secondClass = 'card-4to6';
                break;
                case '8':   secondClass = 'card-8to10';
                break;
                case '10':   secondClass = 'card-8to10';
                break;
            }
            card.classList.add('card', 'shirt', secondClass);
            return card;
        };
        function createDeck (deck) {
            for ( let m of deck) {
                let gameCard = createCard(rowsNumber);
                gameCard.innerHTML = m.value;
                block.append(gameCard);
            }
        };

        function winDeclaration (){
            clearInterval(start);
            block.innerHTML = null;
            block.style.width = "100%";
            let newBlock = createBlock(block,'for_popup');
            createMessage(newBlock, 'Вы победили! Сыграть ещё?');
            let innerBlock = createBlock(newBlock, 'inner_block');
            createButton(innerBlock,'Переиграть', 'btn-restart');
            createButton(innerBlock,'На главную', 'btn-menu');
            clickRetryBtn();
            clickMenuBtn();
        }

        function winCheck () {
            let cards = document.querySelectorAll('.shirt');
            let win = false;
            if (cards.length < 1) {
               setTimeout(winDeclaration, 700);
                win = true;
            }
            return win;
        };

        function playing () {
            let cardsListener = function (event) {
                clickedTarget = event.target;
                clickedClassList = event.target.classList;

                if (clickedClassList.contains('card','shirt') && !clickedClassList.contains('inactive')){
                    clickedClassList.remove('shirt');
                    const firstCard = document.querySelector('.first_card');
                    const secondCard = document.querySelector('.second_card');
                    if (firstCard) {
                        if (clickedTarget === firstCard) {
                            firstCard.classList.remove('first_card');
                            firstCard.classList.add('shirt');
                        }
                        else if ((firstCard.innerHTML === clickedTarget.innerHTML)&&(!secondCard)) {
                            firstCard.classList.remove('first_card');
                            firstCard.classList.add('inactive');
                            clickedClassList.add('inactive');
                        }
                        else if (!secondCard) {
                            clickedClassList.add('second_card');
                        }
                        else {
                            firstCard.classList.add('shirt');
                            firstCard.classList.remove('first_card');
                            secondCard.classList.add('shirt');
                            secondCard.classList.remove('second_card');
                            clickedClassList.add('first_card');
                        }
                    }
                    else {
                        clickedClassList.add('first_card');
                    }

                }
                let won = winCheck();
                if (won === true) {
                    block.removeEventListener('click', cardsListener);
                }
            };
            block.addEventListener('click', cardsListener);
        };

        function createMessage(node, text) {
            let message = document.createElement('span');
            message.innerHTML = text;
            message.classList.add('message');
            node.append(message);
        };

        function createButton(node, name, classs) {
            let button = document.createElement('button');
            button.innerHTML = name;
            button.classList.add('btn', classs);
            node.append(button);
        };

        function clickMenuBtn (){
            const menuButton = document.querySelector('.btn-menu');
            menuButton.addEventListener('click', (r) =>{
                r.preventDefault();
                window.location.reload();
            });
        };

        function clickRetryBtn () {
            const restartButton = document.querySelector('.btn-restart');
            restartButton.addEventListener('click', (r) =>{
                r.preventDefault();
                let rowsNumber = input.value;
                if ((rowsNumber%2 === 1)||(2 > rowsNumber > 10)||(rowsNumber === '')) {
                    rowsNumber = 4;
                }
                block.innerHTML = null;
                let deck = mixPositions (rowsNumber);
                configPlayground (rowsNumber);
                createDeck(deck);
                timer();
                playing();
            });
        };

        function createBlock(node, classs) {
            let newBlock = document.createElement('div');
            newBlock.classList.add(classs);
            node.append(newBlock);
            return newBlock;
        };

        function timer() {
            clearInterval(start);
            let counter = 60;
            countBlock.innerHTML = counter;
            start = setInterval(function() {
                counter--;
                countBlock.innerHTML = counter;
                if (counter < 1) {
                    clearInterval(start);
                    // ВРЕМЯ ВЫШЛО
                    block.innerHTML = null;
                    block.style.width = "100%";
                    let newBlock = createBlock(block,'for_popup');
                    createMessage(newBlock, 'Время вышло! Переиграть?');
                    let innerBlock = createBlock(newBlock, 'inner_block');
                    createButton(innerBlock,'Переиграть', 'btn-restart');
                    createButton(innerBlock,'На главную', 'btn-menu');
                    clickRetryBtn();
                    clickMenuBtn();
                }
            }, 1000);

        };

        let deck = mixPositions (rowsNumber);

        configPlayground (rowsNumber);
        createDeck(deck);
        changeBlock();
        timer();

        playing();
    });
});
