import pokemonList from "../assets/pokemon.json" with {type: "json"};

const actionBar = document.getElementById("message-bar");
const attackButton = document.getElementById("attack-button");
const defendButton = document.getElementById("defend-button");

const playerPokemon = getPlayerPokemon(localStorage.getItem("selection"));
const compPokemon = getCompPokemon();
const plrMaxHP = playerPokemon.HP;
const compMaxHP = compPokemon.HP;
const playerHealth = document.getElementById("player-health");
const compHealth = document.getElementById("opponent-health");




function getPlayerPokemon(selection) {
    for (let i = 0; i < pokemonList.length; i++) {
        if (selection.toLowerCase() == pokemonList[i]["Name"].toLowerCase()) {
            const playerPokemon = pokemonList[i];
            return playerPokemon;
        }
    }
}

function getCompPokemon() {
    const canBeStarter = JSON.parse(localStorage.getItem("canOpponentBeStarter"));
    const firstPokemonNotAStarter = 3;

    if (canBeStarter == false) {
        let compPokemon = pokemonList[Math.round(Math.random() * (pokemonList.length - firstPokemonNotAStarter) + firstPokemonNotAStarter)];
        return compPokemon;
    } else {
        let compPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
        return compPokemon;
    }
}

function calculateDamage(attack, defense, plr1, plr2) {
    let baseDmg = ((((2 * (Math.floor(Math.random() * 11))) / 5 + 2) * attack * (attack / defense)) / 50) + 2;

    switch (plr1["Type"] + plr2["Type"]) {
        case "WaterFire":
            baseDmg = Math.round(baseDmg * 2);
            return baseDmg;
        case "WaterElectric":
            baseDmg = Math.round(baseDmg * 3);
            return baseDmg;
        case "WaterGrass":
            baseDmg = Math.round(baseDmg * 1.5);
            return baseDmg;
        case "FireGrass":
            baseDmg = Math.round(baseDmg * 3);
            return baseDmg;
        case "GrassPoison":
            baseDmg = Math.round(baseDmg * 1.5);
            return baseDmg;
    }
    return Math.round(baseDmg);
}

function initializeDisplay(plr, comp) {
    const playerImage = document.getElementById("player-pokemon");
    const compImage = document.getElementById("opponent-pokemon");

    const playerName = document.getElementById("player-name");
    const compName = document.getElementById("opponent-name");

    playerImage.src = plr.Icon;
    compImage.src = comp.Icon;

    playerName.innerText = plr.Name;
    compName.innerText = comp.Name;

    playerHealth.innerText = plr.HP + " HP";
    compHealth.innerText = comp.HP + " HP";



    const audioControl = document.getElementById("audio-control");
    const theme = new Audio("../assets/pokemon_battleMusic.m4a");
    theme.loop = true;

    audioControl.addEventListener("click", () => {
        if (theme.paused == true) {
            theme.play();
            audioControl.src = "../assets/audio_mute.png";
        } else {
            theme.pause();
            audioControl.src = "../assets/audio_unmute.png";
        }
    })
}

function playerTurn() {
    actionBar.innerText = playerPokemon.Name + "'s turn.";
    attackButton.disabled = false;
    defendButton.disabled = false;

    return new Promise((resolve) => {
        attackButton.addEventListener("click", () => {
            attackButton.disabled = true;
            defendButton.disabled = true;

            const dmg = calculateDamage(playerPokemon.Attack, playerPokemon.Defense, playerPokemon, compPokemon);
            compPokemon.HP -= dmg;
            compPokemon.HP = Math.max(0, compPokemon.HP);
            let healthPercent = (compPokemon.HP / compMaxHP) * 100;

            compHealth.style.width = healthPercent + "%";
            compHealth.innerText = compPokemon.HP + " HP";
            actionBar.innerText = playerPokemon.Name + " dealt " + dmg + " damage!";

            resolve();
        })

        defendButton.addEventListener("click", () => {
            attackButton.disabled = true;
            defendButton.disabled = true;

            const defenseBoost = Math.round(Math.random() * (10 - 5) + 5);
            playerPokemon.Defense += defenseBoost;
            actionBar.innerText = playerPokemon.Name + " received " + defenseBoost + " defense points.";

            resolve();
        });

    });
}

function computerTurn() {
    actionBar.innerText = compPokemon.Name + "'s turn.";
    return new Promise((resolve) => {
        let choice = Math.floor(Math.random() * 2);
        if (choice == 0) {
            const dmg = calculateDamage(compPokemon.Attack, compPokemon.Defense, compPokemon, playerPokemon);
            playerPokemon.HP -= dmg;
            playerPokemon.HP = Math.max(0, playerPokemon.HP);
            setTimeout(() => {
                let healthPercent = (playerPokemon.HP / plrMaxHP) * 100;

                playerHealth.style.width = healthPercent + "%";
                playerHealth.innerText = playerPokemon.HP + " HP";
                actionBar.innerText = compPokemon.Name + " dealt " + dmg + " damage!";

                resolve();
            }, 5000)

        } else {
            const defenseBoost = Math.round(Math.random() * (10 - 5) + 5);
            setTimeout(() => {
                compPokemon.Defense += defenseBoost;
                actionBar.innerText = compPokemon.Name + " received " + defenseBoost + " defense points.";

                resolve();
            }, 5000)
        }
    });
}

async function gameLoop() {
    while (playerPokemon.HP > 0 && compPokemon.HP > 0) {
        await playerTurn();
        if (compPokemon.HP <= 0) break;

        await new Promise((resolve) => setTimeout(resolve, 5000));

        await computerTurn();
        if (playerPokemon.HP <= 0) break;

        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (playerPokemon.HP > 0 && compPokemon.HP <= 0) {
        actionBar.innerText = playerPokemon.Name + " Wins!";
    } else {
        actionBar.innerText = compPokemon.Name + " Wins!";
    }
    
}



function endGame() {
    alert("The game has ended. You will now be taken to the home page.");
    window.location.pathname = "/csp%20project/src/index.html";
}

initializeDisplay(playerPokemon, compPokemon);
gameLoop();