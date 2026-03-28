console.log("Tic Tac Toe")

let turn = "X"
let isGameOver = false

// Change turn
const changeTurn = () => {
    return turn === "X" ? "O" : "X"
}

// Check win
const checkWin = () => {
    let boxtext = document.getElementsByClassName("boxtext")

    let wins = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]

    wins.forEach(e => {
        if (
            boxtext[e[0]].innerText !== "" &&
            boxtext[e[0]].innerText === boxtext[e[1]].innerText &&
            boxtext[e[1]].innerText === boxtext[e[2]].innerText
        ) {
            document.querySelector(".info").innerText = boxtext[e[0]].innerText + " Won 🎉"
            isGameOver = true

            // ✅ SHOW GIF
            document.querySelector(".imgbox img").classList.add("show")
        }
    })
}

// Game logic
let boxes = document.getElementsByClassName("box")

Array.from(boxes).forEach(box => {
    box.addEventListener("click", () => {
        let text = box.querySelector(".boxtext")

        if (text.innerText === "" && !isGameOver) {
            text.innerText = turn
            turn = changeTurn()
            checkWin()

            if (!isGameOver) {
                document.querySelector(".info").innerText = "Turn for " + turn
            }
        }
    })
})

// Reset
document.getElementById("reset").addEventListener("click", () => {

    let texts = document.querySelectorAll(".boxtext")
    texts.forEach(t => t.innerText = "")

    turn = "X"
    isGameOver = false

    document.querySelector(".info").innerText = "Turn for X"

    // ✅ HIDE GIF (WORKING FIX)
    document.querySelector(".imgbox img").classList.remove("show")

    // reset line
    document.querySelector(".line").style.width = "0"
})