const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const starter = formData.get("select-starter");
    const opponentCanBeStarter = formData.get("is-comp-starter");

    localStorage.setItem("selection", starter);
    localStorage.setItem("canOpponentBeStarter", opponentCanBeStarter);

    window.location.href = "./battle.html";

    
});



