import pokemonList from "../assets/pokemon.json" with {type: "json"};

const actionBar = document.getElementById("message-bar");
const attackButton = document.getElementById("attack-button");
const healButton = document.getElementById("heal-button");

const plrPokemon = getPlayerPokemon(localStorage.getItem("selection"));
const compPokemon = getCompPokemon();
const plrMaxHP = plrPokemon.HP;
const compMaxHP = compPokemon.HP;
const playerHealth = document.getElementById("player-health");
const compHealth = document.getElementById("opponent-health");




function getPlayerPokemon(selection) {
    for (let i = 0; i < pokemonList.length; i++) {
        if (selection.toLowerCase() == pokemonList[i]["Name"].toLowerCase()) {
            const plrPokemon = pokemonList[i];
            return plrPokemon;
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
        case "ElectricWater":
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

function calculateHeal(currentHP, maxHP) {
    if (currentHP <= (maxHP / 2)) {
        let HPBoost = Math.floor(currentHP * 6.25);
        let difference = HPBoost - currentHP;
        return difference;
    } else {
        let HPBoost = Math.floor(currentHP * 1.25);
        let difference = HPBoost - currentHP;
        return difference;
    }
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

function performAction(plr, opponent, actionType, plrHealthElem, OpponentHealthElem, plrMaxHP, opponentMaxHP, actionBarElem) {
    if (actionType === "attack") {
        const dmg = calculateDamage(plr.Attack, plr.Defense, plr, opponent);
        opponent.HP -= dmg;
        opponent.HP = Math.max(0, opponent.HP);
        console.log(opponent.Name + "\n" + opponent.HP);
        let healthPercent = (opponent.HP / opponentMaxHP) * 100;

        OpponentHealthElem.style.width = healthPercent + "%";
        OpponentHealthElem.innerText = opponent.HP + " HP";
        actionBarElem.innerText = plr.Name + " dealt " + dmg + " damage!";
    } else if (actionType === "heal") {
        const HPBoost = calculateHeal(plr.HP, plrMaxHP);
        console.log(plr.Name + "\n" + plr.HP);


        let healthPercent = (plr.HP / plrMaxHP) * 100;

        plrHealthElem.style.width = healthPercent + "%";
        plrHealthElem.innerText = plr.HP + " HP";
        actionBarElem.innerText = plr.Name + " recovered " + HPBoost + " HP.";
    }
}


function playerTurn() {
    actionBar.innerText = plrPokemon.Name + "'s turn.";
    attackButton.disabled = false;
    healButton.disabled = false;
    return new Promise((resolve) => {
        attackButton.addEventListener("click", () => {
            attackButton.disabled = true;
            healButton.disabled = true;
            performAction(plrPokemon, compPokemon, "attack", playerHealth, compHealth, plrMaxHP, compMaxHP, actionBar);
        }, { once: true });
        healButton.addEventListener("click", () => {
            attackButton.disabled = true;
            healButton.disabled = true;
            performAction(plrPokemon, compPokemon, "heal", playerHealth, compHealth, plrMaxHP, compMaxHP, actionBar);
        }, { once: true });
        resolve();
    });
}

function computerTurn() {
    actionBar.innerText = compPokemon.Name + "'s turn.";

    return new Promise((resolve) => {
        setTimeout(() => {
            if (compPokemon.HP >= (compPokemon.HP * 0.7)) {
                if (Math.random() < 0.7) {
                    performAction(compPokemon, plrPokemon, "attack", compHealth, playerHealth, compMaxHP, plrMaxHP, actionBar);
                } else {
                    performAction(compPokemon, plrPokemon, "heal", compHealth, playerHealth, compMaxHP, plrMaxHP, actionBar);
                }
            } else {
                if (Math.random() < 0.7) {
                    performAction(compPokemon, plrPokemon, "heal", compHealth, playerHealth, compMaxHP, plrMaxHP, actionBar);
                } else {
                    performAction(compPokemon, plrPokemon, "attack", compHealth, playerHealth, compMaxHP, plrMaxHP, actionBar);
                }
            }
            resolve();
        }, 5000);
    });
}


function endGame() {
    if (plrPokemon.HP > 0 && compPokemon.HP <= 0) {
        actionBar.innerText = plrPokemon.Name + " Wins!";
    } else {
        actionBar.innerText = compPokemon.Name + " Wins!";
    }

    setTimeout(() => {
        alert("The game has ended. You will now be taken to the home page.")
        window.location.pathname = "/csp%20project/src/index.html";
    }, 5000);
}

async function gameLoop() {
    while (plrPokemon.HP > 0 && compPokemon.HP > 0) {
        await playerTurn();
        if (compPokemon.HP <= 0) break;

        await new Promise((resolve) => setTimeout(resolve, 5000));

        await computerTurn();
        if (plrPokemon.HP <= 0) break;

        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    endGame();
}

initializeDisplay(plrPokemon, compPokemon);
gameLoop();

/*
Credits:
Pokemon icons from Pokemon Database pokemondb.net
Audio icons from Adobe Stock stock.adobe.com
Pokemon Red and Blue Opening Theme is owned by the Pokemon Company International
*/