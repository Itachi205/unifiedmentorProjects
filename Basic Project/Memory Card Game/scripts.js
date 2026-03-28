const cards = document.querySelectorAll('.memorycard');

let flippedCards = [];

function flipcard() {

    this.classList.add('flip');

    flippedCards.push(this);

    if (flippedCards.length === 3) {

        let firstCard = flippedCards[0];
        let secondCard = flippedCards[1];
        let thirdCard = flippedCards[2];

        console.log(firstCard.dataset.framework);
        console.log(secondCard.dataset.framework);
        console.log(thirdCard.dataset.framework);

        if (
            firstCard.dataset.framework === secondCard.dataset.framework &&
            secondCard.dataset.framework === thirdCard.dataset.framework
        ) {
            console.log("Match found!");

            firstCard.removeEventListener('click', flipcard);
            secondCard.removeEventListener('click', flipcard);
            thirdCard.removeEventListener('click', flipcard);

            flippedCards = [];

        } else {

            setTimeout(() => {

                firstCard.classList.remove('flip');
                secondCard.classList.remove('flip');
                thirdCard.classList.remove('flip');

                flippedCards = [];

            }, 1000);

        }

        console.log("Function executed");

    }

}

(function shuffle(){
    cards.forEach(card =>{
        let randomPos = Math.floor(Math.random() * 12);
        card.style.order = randomPos;
    });
})();

cards.forEach(card => card.addEventListener('click', flipcard));