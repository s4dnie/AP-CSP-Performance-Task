import pokemonList from "../assets/pokemon.json" with {type: "json"};

const plrPokemon = getPlayerPokemon(localStorage.getItem("selection"));
const comPokemon = getComputerPokemon();
const plrHealthBar = document.getElementById("player-health");
const comHealthBar = document.getElementById("opponent-health");

const actionBar = document.getElementById("message-bar");
const attackButton = document.getElementById("attack-button");
const healButton = document.getElementById("heal-button");
let plrHasChosen = false;

//Checks the form data against pokemonList and returns the matching Pokemon object
//selection {string} - the starter Pokemon that the user selected on the form page
//return {object} - the user's Pokemon as an object
function getPlayerPokemon(selection) {
    for (let i = 0; i < pokemonList.length; i++) {
        if (selection.toLowerCase() == pokemonList[i]["Name"].toLowerCase()) {
            const plrPokemon = pokemonList[i];
            return plrPokemon;
        }
    }
}
//Randomly selects the computer's Pokemon based on whether the user allows for it to be a starter or not
//return {object} - the computer's Pokemon as an object
function getComputerPokemon() {
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
//Calculates the amount of damage given when either the player or computer chooses to attack
//attack {number} - the current attacker's attack stat
//defense {number} - the current attacker's defense stat
//actor {string} - who is currently attacking
//target {string} - who is currently being attacked
//return {number} - the final amount of damage given
function calculateDamage(attack, defense, actor, target) {
    let baseDmg = ((((2 * (Math.floor(Math.random() * 11))) / 5 + 2) * attack * (attack / defense)) / 50) + 2;

    switch (actor["Type"] + target["Type"]) {
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
//Calculates the amount of health recovered when either the player or computer chooses to heal
//currentHP {number} - the actor's current health
//maxHP {number} - the actor's max possible health
//return {number} - the final amount of health recovered
function calculateHeal(currentHP, maxHP) {
    if (currentHP <= (maxHP / 2)) {
        let HPBoost = Math.floor(currentHP * 2);
        let difference = HPBoost - currentHP;
        return difference;
    } else {
        let HPBoost = Math.floor(currentHP * 1.25);
        let difference = HPBoost - currentHP;
        return difference;
    }
}
//Updates the screen from default values to the values corresponding to the player and computer Pokemon
//plr {string} - the player Pokemon and its display
//com {string} - the computer Pokemon and its display
function initializeDisplay(plr, com) {
    const plrIcon = document.getElementById("player-pokemon");
    const comIcon = document.getElementById("opponent-pokemon");

    const plrName = document.getElementById("player-name");
    const comName = document.getElementById("opponent-name");

    plrIcon.src = plr.Icon;
    comIcon.src = com.Icon;

    plrName.innerText = plr.Name;
    comName.innerText = com.Name;

    plrHealthBar.innerText = plr["Max HP"] + " HP";
    comHealthBar.innerText = com["Max HP"] + " HP";

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
//Performs either an attack or heal during the actor's turn
//actor {string} - who's turn it currently is
//target {string} - who's turn it is not
//actionType {string} - whether the actor is attacking or healing
//actorHPBar {HTMLElement} - the actor's health bar display
//targetHPBar {HTMLElement} - the target's health bar display
function action(actor, target, actionType, actorHPBar, targetHPBar) {
    if (actionType === "heal") {
        const HPBoost = calculateHeal(actor["Current HP"], actor["Max HP"]);
        actor["Current HP"] += HPBoost;
        const healthIncrease = actor["Current HP"] / actor["Max HP"] * 100;
        actor["Current HP"] = Math.min(actor["Current HP"], actor["Max HP"]);

        actionBar.innerText = actor["Name"] + " recovered " + HPBoost + " HP!";
        actorHPBar.style.width = healthIncrease + "%";
        actorHPBar.innerText = actor["Current HP"] + " HP";
    } else if (actionType === "attack") {
        const dmg = calculateDamage(actor["Attack"], actor["Defense"], actor, target);
        target["Current HP"] -= dmg;
        target["Current HP"] = Math.max(target["Current HP"], 0);
        const healthDecrease = target["Current HP"] / target["Max HP"] * 100;

        actionBar.innerText = actor["Name"] + " dealt " + dmg + " damage!";
        targetHPBar.style.width = healthDecrease + "%";
        targetHPBar.innerText = target["Current HP"] + " HP";
    }
}

//Displays that it is the player's turn and awaits the player's action 
function plrTurn() {
    actionBar.innerText = plrPokemon["Name"] + "'s turn.";

    attackButton.disabled = false;
    healButton.disabled = false;
    plrHasChosen = false;

    return new Promise((resolve) => {
        let check = setInterval(() => {
            if (plrHasChosen == true) {
                clearInterval(check);
                resolve();
            }
        }, 1000)
    });
}
//Displays that it is the computer's turn and awaits the computer's action
function comTurn() {
    actionBar.innerText = comPokemon["Name"] + "'s turn.";

    return new Promise((resolve) => {
        setTimeout(() => {
            if (comPokemon["Current HP"] >= (comPokemon["Max HP"] * 0.5)) {
                if (Math.random() < 0.8) {
                    action(comPokemon, plrPokemon, "attack", comHealthBar, plrHealthBar);
                } else {
                    action(comPokemon, plrPokemon, "heal", comHealthBar, plrHealthBar);
                }
            } else {
                if (Math.random() < 0.7) {
                    action(comPokemon, plrPokemon, "heal", comHealthBar, plrHealthBar);
                } else {
                    action(comPokemon, plrPokemon, "attack", comHealthBar, plrHealthBar);
                }
            }
            resolve();
        }, 5000);
    });
}
//Loops the game until either the player or computer runs out of health, then ends the game
async function game() {
    initializeDisplay(plrPokemon, comPokemon);
    do {
        await plrTurn();
        if (comPokemon["Current HP"] <= 0) break;

        await new Promise((resolve) => setTimeout(resolve, 5000));

        await comTurn();

        if (plrPokemon["Current HP"] <= 0) break;

        await new Promise((resolve) => setTimeout(resolve, 5000));
    } while (plrPokemon["Current HP"] > 0 && comPokemon["Current HP"] > 0)

    endGame();
}
//Ends the game by displaying the winner, then taking the user back to the home page
function endGame() {
    if (plrPokemon["Current HP"] > 0 && comPokemon["Current HP"] <= 0) {
        actionBar.innerText = plrPokemon["Name"] + " Wins!";
    } else {
        actionBar.innerText = comPokemon["Name"] + " Wins!";
    }

    setTimeout(() => {
        alert("The game has ended. You will now be taken to the home page.")
        window.location.pathname = "/csp%20project/src/index.html";
    }, 5000);
}

attackButton.addEventListener("click", () => {
    attackButton.disabled = true;
    healButton.disabled = true;

    plrHasChosen = true;
    action(plrPokemon, comPokemon, "attack", plrHealthBar, comHealthBar);
});

healButton.addEventListener("click", () => {
    attackButton.disabled = true;
    healButton.disabled = true;

    plrHasChosen = true;
    action(plrPokemon, comPokemon, "heal", plrHealthBar, comHealthBar);
});

game();

//Credits

//Pokemon characters and the Pokemon Red and Blue Opening Theme are owned by the Pokemon Company