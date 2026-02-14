import pokemon from "../assets/pokemon.json";
const parsedPokemon = JSON.parse(pokemon);

const form = document.getElementById("form");

let getFormData = function (form) {
    const formData = new FormData(form);
}

let isPlayerTurn = false;
let isBattleOngoing = true;
let playerCanTakeDamage = true;
let compCanTakeDamage = false;

form.addEventListener("submit", (event) => {
    event.preventDefault();
    getFormData(event.target);
});

function selectCompPokemon() {
    let randomIndex = Math.floor(Math.random() * pokemon.length);
    const comp = parsedPokemon[randomIndex];

    return comp;
}

function calculateDamage(pokemon) {
    const damage = ((((2 * 20) / 5 + 2)) * pokemon.Attack * (pokemon.Attack / pokemon.Defense)) / 50
    return damage;
}   

function compMove(pokemon) {
    const choice = Math.floor(Math.random() * 2);
    if (choice == 0) {
        calculateDamage(pokemon);
    } else {
        compCanTakeDamage = false;
    }
}
function gameLoop() {
    isBattleOngoing = true;

    const playerPokemon = formData.get("Name");
    const computerPokemon = selectCompPokemon();



    let playerTurns = 0;
    let compTurns = 0;

    for (let i = 0; i > computerPokemon.HP; i++) {
        if (isPlayerTurn == true) {
            let playerChoice = window.prompt("Enter either 'attack' or 'defend' to continue.");
            if (playerChoice.toUpperCase() == "ATTACK") {
                const dmg = calculateDamage(playerPokemon);
                computerPokemon.HP -= dmg;
                playerTurns++;
                isPlayerTurn == false;
            } else if (playerChoice.toUpperCase() == "DEFEND") {
                playerCanTakeDamage = false;
                playerTurns++;
                isPlayerTurn == false;
            }
        }

    }
}
