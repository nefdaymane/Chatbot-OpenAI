const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    chatLi.innerHTML = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const handleChat = () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi, userMessage); // Appeler votre fonction pour générer une réponse ici
    }, 600);
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

// Sélectionnez l'icône du microphone par son ID
const microphoneIcon = document.getElementById("microphone");

// Ajoutez un gestionnaire d'événements pour le clic sur l'icône du microphone
microphoneIcon.addEventListener("click", function() {
    // Vérifie si la classe .round-background est déjà présente
    if (microphoneIcon.classList.contains("round-background")) {
        // La classe .round-background est déjà présente, alors on la supprime
        microphoneIcon.classList.remove("round-background");
    } else {
        // La classe .round-background n'est pas présente, alors on l'ajoute pour appliquer le fond rond
        microphoneIcon.classList.add("round-background");
    }
});





function generateResponse(incomingChatLi, userMessage) {
    // Envoyez la requête POST à votre serveur Flask
    fetch("http://localhost:5000/generer-texte", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: userMessage }),
        })
        .then((res) => res.json())
        .then((data) => {
            const texteGenere = data.texte_genere;

            incomingChatLi.querySelector("p").textContent = texteGenere;

            const speechSynthesis = window.speechSynthesis;
            const speechUtterance = new SpeechSynthesisUtterance(texteGenere);
            speechSynthesis.speak(speechUtterance);
        })
        .catch(() => {
            incomingChatLi.querySelector("p").classList.add("error");
            incomingChatLi.querySelector("p").textContent = "Oops! Une erreur s'est produite. Veuillez réessayer.";
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}
document.addEventListener("DOMContentLoaded", function() {
    const microphoneButton = document.getElementById("microphone");
    const recognition = new webkitSpeechRecognition();

    microphoneButton.addEventListener("click", function() {
        // Activer l'icône du microphone
        microphoneButton.classList.add("round-background");

        // Configuration de la reconnaissance vocale
        recognition.lang = "en-EN"; // Remplacez "en-EN" par la langue de votre choix
        recognition.continuous = false; // Cesse d'écouter après un discours
        recognition.interimResults = false; // Obtient uniquement le résultat final

        // Démarrer la reconnaissance vocale
        recognition.start();

        // Gérer le résultat de la reconnaissance
        recognition.onresult = function(event) {
            const result = event.results[0][0].transcript;

            if (result) {
                // Le texte reconnu est dans "result"
                console.log("Texte reconnu: " + result);

                // Envoyer le texte reconnu au backend
                fetch("http://localhost:5000/reconnaissance-vocale", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ texte_reconnu: result }),
                    })
                    .then((response) => response.json())
                    .then((data) => {
                        // Traiter la réponse du backend si nécessaire
                        console.log("Réponse du backend: ", data);
                    })
                    .catch((error) => {
                        // Gérer les erreurs
                        console.error("Erreur lors de la requête vers le backend : " + error);
                    });
                const userChatLi = createChatLi(result, "outgoing");
                chatbox.appendChild(userChatLi);
                chatbox.scrollTo(0, chatbox.scrollHeight);

                // Envoyer la réponse à la fonction generateResponse
                generateResponse1(result);
            }
        }

        recognition.onerror = function(event) {
            // Gérer les erreurs de reconnaissance vocale
            console.error("Erreur lors de la reconnaissance vocale: " + event.error);
        }

        recognition.onend = function() {
            // Désactiver l'icône du microphone
            microphoneButton.classList.remove("round-background");
        }
    });
});


function generateResponse1(texteReconnu) {
    // Créez un nouvel élément incomingChatLi
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Envoyez la requête POST à votre serveur Flask
    fetch("http://localhost:5000/generer-texte", {
            method: "POST", // Utilisez la méthode POST
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: texteReconnu }),
        })
        .then((res) => res.json())
        .then((data) => {

            // Utilisez la réponse dans data.texte_genere comme vous le souhaitez
            incomingChatLi.querySelector("p").textContent = data.texte_genere;
            const speechSynthesis = window.speechSynthesis;
            const speechUtterance = new SpeechSynthesisUtterance(data.texte_genere);
            speechSynthesis.speak(speechUtterance);

            // Ajoutez également la question reconnue à la zone de chat de l'utilisateur

        })
        .catch(() => {
            incomingChatLi.querySelector("p").classList.add("error");
            incomingChatLi.querySelector("p").textContent = "Oops! Une erreur s'est produite. Veuillez réessayer.";
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}