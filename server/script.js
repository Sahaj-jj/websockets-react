const GameModule = (function () {
    let ws = null;
    let clientId = null;
    let gameId = null;

    const createGameBtn = document.getElementById("create-game-btn");
    const joinGameBtn = document.getElementById("join-game-btn");
    const joinGameInput = document.getElementById("join-game-input");
    const joinCont = document.getElementById("join-cont");

    function init() {
        ws = new WebSocket("ws://localhost:9090");
        ws.onmessage = (message) => {
            const response = JSON.parse(message.data);

            if (response.method === "connect") {
                clientId = response.clientId;
            } else if (response.method === "create") {
                gameId = response.game.id;

                ws.send(
                    JSON.stringify({
                        method: "join",
                        clientId,
                        gameId,
                    })
                );

                console.log(`Game created successfully! gameId: ${gameId}`);
            } else if (response.method === "join") {
                while (joinCont.firstChild) {
                    joinCont.removeChild(joinCont.firstChild);
                }
                response.game.clients.forEach((client) => {
                    const joineeDiv = document.createElement("div");
                    joineeDiv.textContent = `clientId: ${client.clientId}`;
                    joineeDiv.style.border = `1px solid ${client.color}`;
                    joineeDiv.classList.add("joinee");
                    joinCont.append(joineeDiv);
                });
            }

            console.log(response);
        };

        createGameBtn.addEventListener("click", () => {
            const payload = {
                method: "create",
                clientId,
            };

            ws.send(JSON.stringify(payload));
        });

        joinGameBtn.addEventListener("click", () => {
            const inputGameId = joinGameInput.value;
            const payload = {
                method: "join",
                clientId,
                gameId: inputGameId,
            };

            ws.send(JSON.stringify(payload));
        });
    }

    return {
        init,
    };
})();

GameModule.init();
