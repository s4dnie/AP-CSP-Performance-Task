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

function calculateHeal(hp, maxHP) {
    if (hp < (maxHP / 2)) {
        let HPBoost = Math.floor(hp * .0625 * 100);
        let difference = hp - HPBoost;
        return difference;
    } else {
        let HPBoost = Math.floor(hp * .0125 * 100);
        let difference = HPBoost - hp;
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

function playerTurn() {
    actionBar.innerText = plrPokemon.Name + "'s turn.";
    attackButton.disabled = false;
    healButton.disabled = false;

    return new Promise((resolve) => {
        attackButton.addEventListener("click", () => {
            attackButton.disabled = true;
            healButton.disabled = true;

            const dmg = calculateDamage(plrPokemon.Attack, plrPokemon.Defense, plrPokemon, compPokemon);
            compPokemon.HP -= dmg;
            compPokemon.HP = Math.max(0, compPokemon.HP);
            let healthPercent = (compPokemon.HP / compMaxHP) * 100;

            compHealth.style.width = healthPercent + "%";
            compHealth.innerText = compPokemon.HP + " HP";
            actionBar.innerText = plrPokemon.Name + " dealt " + dmg + " damage!";

            resolve();
        }, { once: true })

        healButton.addEventListener("click", () => {
            attackButton.disabled = true;
            healButton.disabled = true;

            const HPBoost = calculateHeal(plrPokemon.HP, plrMaxHP);
            plrPokemon.HP += HPBoost;
            plrPokemon.HP = Math.min(plrPokemon.HP, plrMaxHP);
            let healthPercent = (plrPokemon.HP / plrMaxHP) * 100;

            playerHealth.style.width = healthPercent + "%";
            playerHealth.innerText = plrPokemon.HP + " HP";
            actionBar.innerText = plrPokemon.Name + " recovered " + HPBoost + " HP.";

            resolve();
        }, { once: true });

    });
}

function computerTurn() {
    actionBar.innerText = compPokemon.Name + "'s turn.";
    return new Promise((resolve) => {
        let choice = Math.floor(Math.random() * 2);
        if (choice == 0) {
            const dmg = calculateDamage(compPokemon.Attack, compPokemon.Defense, compPokemon, plrPokemon);
            plrPokemon.HP -= dmg;
            plrPokemon.HP = Math.max(0, plrPokemon.HP);
            setTimeout(() => {
                let healthPercent = (plrPokemon.HP / plrMaxHP) * 100;

                playerHealth.style.width = healthPercent + "%";
                playerHealth.innerText = plrPokemon.HP + " HP";
                actionBar.innerText = compPokemon.Name + " dealt " + dmg + " damage!";

                resolve();
            }, 5000)

        } else {
            const HPBoost = calculateHeal(compPokemon.HP, compMaxHP);
            setTimeout(() => {
                compPokemon.HP += HPBoost;
                compPokemon.HP = Math.min(plrPokemon.HP, plrMaxHP);
                let healthPercent = (compPokemon.HP / compMaxHP) * 100;

                compHealth.style.width = healthPercent + "%";
                compHealth.innerText = compPokemon.HP + " HP";
                actionBar.innerText = compPokemon.Name + " recovered " + HPBoost + " HP.";

                resolve();
            }, 5000)
        }
    });
}

function endGame() {
    alert("The game has ended. You will now be taken to the home page.");
    window.location.pathname = "/csp%20project/src/index.html";
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

    if (plrPokemon.HP > 0 && compPokemon.HP <= 0) {
        actionBar.innerText = plrPokemon.Name + " Wins!";
    } else {
        actionBar.innerText = compPokemon.Name + " Wins!";
    }

}

initializeDisplay(plrPokemon, compPokemon);
gameLoop();

/*
Credits:
Pokemon icons from Pokemon Database pokemondb.net
Audio icons from Adobe Stock stock.adobe.com
Pokemon Red and Blue Opening Theme is owned by the Pokemon Company International
*/