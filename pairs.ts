export { Game };

class Card {
  value: number;
  id: number;
  element: HTMLElement; 
  isFound: boolean = false; 

  constructor(props: {value: number, id: number}) {
    const {value, id} = props;
    this.value = value;
    this.id = id;
    let cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.addEventListener('click',() => {
      if(!this.isFound) {
        cardElement.classList.toggle('flipped');
      }
    });
    const front = createBlock(cardElement, 'card__front');
    createBlock(front, 'card__content', 'div', this.value.toString());
    createBlock(cardElement, 'card__back');

    this.element = cardElement;
  }
}

type Difficulty = {
  name: string,
  cardsQuantity: number,
  cardsRows: number,
  time:  number,
  text: string,
}

const difficulties: Difficulty[] = [
  {
    name: "low",
    cardsQuantity: 8,
    cardsRows: 2,
    time: 40,
    text: 'Легкая',
  },
  {
    name: "normal",
    cardsQuantity: 16,
    cardsRows: 4,
    time: 70,
    text: 'Средняя',
  },
  {
    name: "high",
    cardsQuantity: 28,
    cardsRows: 4,
    time: 100,
    text: 'Тяжёлая',
  },
  {
    name: "extremal",
    cardsQuantity: 36,
    cardsRows: 4,
    time: 160,
    text: 'Высшая',
  },
];

const defaultDifficulty = {
  name: "normal",
  cardsQuantity: 16,
  cardsRows: 4,
  time: 80,
  text: 'Средняя',
}

type ElementOrNull = HTMLElement | null;  
class Game {
  private cards: Card[];
  private counter: number = 60;  
  readonly difficulties = difficulties;
  private isCustom: boolean = false;
  private choosenDifficulty: Difficulty = defaultDifficulty;
  private layout: {
    base: ElementOrNull;
    gameboardWrap: ElementOrNull;
    gameboard: ElementOrNull;
    menu: ElementOrNull;
    defaultForm: ElementOrNull;
    customForm: {
      wrap: ElementOrNull;
      time: HTMLInputElement | null;
      quantity: HTMLInputElement | null;
    };
    counter: ElementOrNull;
    difficultyInputs: HTMLInputElement[];
    result: ElementOrNull;
    resultText: ElementOrNull;
  };
  private timer: any = null;
  private win: boolean = false;
  constructor(parentElement: HTMLElement) {
    this.layout = {
      base: null,
      gameboardWrap: null,
      gameboard: null,
      menu: null,
      defaultForm: null,
      customForm: {
        wrap: null,
        time: null,
        quantity: null
      },
      counter: null,
      difficultyInputs: [],
      result: null,
      resultText: null,
    };

    this.createLayout(parentElement);    
  };

  private createLayout = (parentElement: HTMLElement) => {
    // создаём обёртку игры
    this.layout.base = createBlock(parentElement, 'pairs');
    createBlock(this.layout.base, 'pairs__heading', 'h1', `Найди пару`);

    // создаём элемент обратного отсчёта времени
    this.layout.counter = createBlock(this.layout.base, 'pairs__countdown section', 'span');

    // создаём блок с выбором сложности и кнопкой начала игры
    this.layout.menu = createBlock(this.layout.base, 'pairs__menu');
    this.layout.defaultForm = createBlock(this.layout.menu, 'pairs__menu pairs__menu_default section');
    createBlock(this.layout.defaultForm, 'text', 'p', 'Выберите сложность');
    const fieldset = createBlock(this.layout.defaultForm, 'pairs__difficulty', 'fieldset');
    for (let difficulty of this.difficulties) {
      const label = createBlock(fieldset, 'pairs__label', 'label');
      createBlock(label, 'text button', 'span', difficulty.text);
      const difficultyInput = createBlock(label, 'pairs__input visually-hidden', 'input') as HTMLInputElement;
      if(difficulty.name === defaultDifficulty.name) {
        difficultyInput.setAttribute('checked', 'checked');
      }
      difficultyInput.setAttribute('type', 'radio');
      difficultyInput.setAttribute('value', difficulty.name);
      difficultyInput.setAttribute('name', 'difficulty');
      this.layout.difficultyInputs.push(difficultyInput);
    }
    const showCustomMenuButton = createBlock(fieldset, 'button button_to-custom', 'button','Свой вариант');
    showCustomMenuButton.addEventListener('click', () => {
      this.toggleOptionMenus(true);
    });

    // создаём меню для пользовательских настроек игры
    this.layout.customForm.wrap = createBlock(this.layout.menu, 'pairs__menu pairs__menu_custom section hidden', 'fieldset');      
    const quantityLabel = createBlock(this.layout.customForm.wrap, 'pairs__custom-label', 'label');
    createBlock(quantityLabel, 'pairs__label-text', 'span', 'Введите количество карточек (от 8 до 40 и кратное 4)');
    this.layout.customForm.quantity = createBlock(quantityLabel, 'pairs__custom-input', 'input') as HTMLInputElement;
    this.layout.customForm.quantity.setAttribute('type', 'number');
    this.layout.customForm.quantity.setAttribute('value', '16');
    this.layout.customForm.quantity.setAttribute('min', '8');
    this.layout.customForm.quantity.setAttribute('max', '40');

    const timerLabel = createBlock(this.layout.customForm.wrap, 'pairs__custom-label', 'label');
    createBlock(timerLabel, 'pairs__label-text', 'span', 'Введите время, отведённое на поиск пар (в секундах)');
    this.layout.customForm.time = createBlock(timerLabel, 'pairs__custom-input', 'input') as HTMLInputElement;
    this.layout.customForm.time.setAttribute('type', 'number');
    this.layout.customForm.time.setAttribute('value', '120');
    this.layout.customForm.time.setAttribute('min', '10');

    const toDefaultMenuButton = createBlock(this.layout.customForm.wrap, 'button button_to-default', 'button','К настройкам по умолчанию');
    toDefaultMenuButton.addEventListener('click', () => {
      this.toggleOptionMenus();
    });

    const startButton = createBlock(this.layout.menu, 'button button_start', 'button','Начать игру');
    startButton.addEventListener('click', () => {
      this.start();
    });

    // создаём блок с результатом игры и кнопками перезапуска и перенастройки игры
    this.layout.result = createBlock(this.layout.base, 'pairs__result hidden');
    this.layout.resultText = createBlock(this.layout.result, 'text', 'p');
    const resultButtonsWrap = createBlock(this.layout.result, 'pairs__result-buttons');
    const restartButton = createBlock(resultButtonsWrap, 'button button_restart', 'button','Перезапустить игру');
    restartButton.addEventListener('click', () => {
      this.start(false);
    });
    const showMenuButton = createBlock(resultButtonsWrap, 'button', 'button','Изменить сложность');
    showMenuButton.addEventListener('click', () => {
      this.showMenu();
    });

    // создаём блок с игровым полем
    this.layout.gameboardWrap = createBlock(this.layout.base, 'pairs__gameboard-wrap hidden');
    this.layout.gameboard = createBlock(this.layout.gameboardWrap, 'pairs__gameboard');
    this.layout.gameboard.addEventListener('click', this.listenClick);

    // создаём кнопку прерывания игры
    const stopButton = createBlock(this.layout.gameboardWrap, 'button button_stop', 'button','Завершить игру');
    stopButton.addEventListener('click', () => {
      this.over(true);
    });    
  };

  public start(isNewGame: boolean = true) {
    this.clear();     
    if(isNewGame) {
      this.setOptions();
      this.createDeck();
    } else {
      this.remixDeck();
    }
    this.insertDeckIntoBlock();
    this.startTimer();
    this.showGameboard(); 
  };

  private clear() {
    this.win = false;
    this.cards?.forEach(card => {
      card.isFound = false;
      card.element.className = 'card';
    });
    clearInterval(this.timer);
    if(this.layout.gameboard?.innerHTML) {
      this.layout.gameboard.innerHTML = '';
    }
  };

  private setOptions() {
    if(this.isCustom && this.layout?.customForm.quantity && this.layout?.customForm.time) {
      let cardsQuantity = Number(this.layout.customForm.quantity.value);
      let cardsRows = 4;
      if(!cardsQuantity ||cardsQuantity < 8 || cardsQuantity > 40) {
        console.error('wrong quantity');
        cardsQuantity = 16;
      } else {
        const mod = cardsQuantity % 4;
        if(mod !== 0) {
          cardsQuantity = cardsQuantity - mod;
        } else if (cardsQuantity === 12) {
          cardsRows = 3;
        } else if(cardsQuantity === 8) {
          cardsRows = 2;
        }
      }     
      
      const customTime = Number(this.layout.customForm.time.value);
      const time = customTime  > 5 ? customTime : 60;

      this.choosenDifficulty = {
        name: 'custom',
        cardsQuantity,
        time,
        cardsRows,
        text: 'Пользовательская'
      }
    } else {
      const activeDifficultyInput = this.layout.difficultyInputs.find(input => input.checked) as HTMLInputElement;
      const difficultyValue = activeDifficultyInput?.value;
      if(difficultyValue) {
        const choosenDifficulty = this.difficulties.find(difficulty => difficulty.name === (activeDifficultyInput?.value));  
        if(choosenDifficulty) {
          this.choosenDifficulty = choosenDifficulty;
        }
      } else {
        console.error('no difficulty value')
      }
    }
  };

  private createDeck() {
    const cards: Card[] = [];
    // создаём индексы, содержимое карточек и перемешиваем
    for (let i = 1;  i <= this.choosenDifficulty.cardsQuantity / 2; i++) {
      cards.push(new Card({
        id: Math.floor(Math.random() * 1000000), 
        value: i
      }));
      cards.push(new Card({
        id:  Math.floor(Math.random() * 1000000),
        value: i
      }));
    }

    this.cards = cards;
    this.sortDeck();
  }

  private sortDeck() {
    this.cards.sort((cardA: Card, cardB: Card) => {
      return cardA.id > cardB.id ? 1 : -1;
    });
  }

  private remixDeck() {
    this.cards.forEach(card => {
      card.id = Math.floor(Math.random() * 1000000);
    });
    this.sortDeck()
  }

  private insertDeckIntoBlock() {
    if(this.layout?.gameboard) {
      this.layout.gameboard.className = `pairs__gameboard rows-${this.choosenDifficulty.cardsRows} section`;
    }    
    for (let card of this.cards) {
      this.layout.gameboard?.append(card.element);
    }
  }

  private startTimer() {
    this.counter = this.choosenDifficulty.time;
    clearInterval(this.timer);
    if(this.layout?.counter) {
      this.layout.counter.innerHTML = this.counter.toString();
      this.timer= setInterval(() => {
        this.counter--;
        this.layout?.counter ? this.layout.counter.innerHTML = this.counter.toString() : console.error('counter element is not defined');
        if (this.counter < 1) {    
          this.over()
        }
      }, 1000);
    } else {
      console.error('counter element is not defined');
    }
  };

  private over(interrupted: boolean = false) {
    if(this.layout.result) {
      const resultText = interrupted ? 'Игра прервана' : this.win ? 'Вы победили' : 'Время вышло';

      if(this.layout?.resultText) {
        this.layout.resultText.innerHTML = `${resultText}! Сыграть ещё?`;
      }
      this.showResult();

      this.clear();
    } else {
      console.error('resultElement is not defined');
    }
  }

  private listenClick = (event: Event) => {
    this.layout?.gameboard?.classList.add('deaf');
    setTimeout(() => {
      this.layout?.gameboard?.classList.remove('deaf');
    }, 300);
    if(!(event.target as HTMLElement).classList.contains('card')) {
      const flippedCards = this.cards.filter(card => !card.isFound && card.element.classList.contains('flipped'));
      flippedCards.forEach(card => {
        card.element.classList.remove('flipped');
      });
    } else {      
      const flippedCards = this.cards.filter(card => !card.isFound && card.element.classList.contains('flipped'));
      if(flippedCards.length === 2) { 
        if(flippedCards[0].value === flippedCards[1].value) {
          flippedCards.forEach(card => {
            card.element.classList.add('found');
            card.isFound = true;
            this.checkWin();
          });
        } else {
          setTimeout(() => {
            flippedCards.forEach(card => {
              card.element.classList.remove('flipped');
            });
          }, 700);
        }
      }      
    }
  };

  checkWin() {
    if(this.cards.every(card => card.isFound)) {
      this.win = true;
      setTimeout(() => {
        this.over();
      },800);      
    }
  }

  private showMenu(){
    this.layout?.menu?.classList.remove('hidden');
    this.layout?.result?.classList.add('hidden');
    this.layout?.gameboardWrap?.classList.add('hidden');
  };

  private showResult() {
    this.layout?.menu?.classList.add('hidden');
    this.layout?.result?.classList.remove('hidden');
    this.layout?.gameboardWrap?.classList.add('hidden');
  }

  private showGameboard() {
    this.layout?.menu?.classList.add('hidden');
    this.layout?.result?.classList.add('hidden');
    this.layout?.gameboardWrap?.classList.remove('hidden');
  };

  private toggleOptionMenus(command: boolean = false){
    if(this.layout?.defaultForm && this.layout?.customForm) {
      if(command) {
        this.layout?.defaultForm?.classList.add('hidden');
        this.layout?.customForm?.wrap?.classList.remove('hidden');
        this.isCustom = true;
      } else {
        this.layout?.defaultForm?.classList.remove('hidden');
        this.layout?.customForm?.wrap?.classList.add('hidden');
        this.isCustom = false;
      }
    } else {
      console.error('layout is not defined');
    }
  };
}

function createBlock(node: HTMLElement, classs: string, tagName: string = 'div', text?: string): HTMLElement {
  const newBlock = document.createElement(tagName);
  newBlock.className = classs;
  if(text) {
    newBlock.innerHTML = text;
  }
  node.append(newBlock);
  return newBlock;
};
