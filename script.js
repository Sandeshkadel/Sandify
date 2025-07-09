
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.getElementById("landing-screen").style.display = "none";
        document.getElementById("app-container").style.display = "block";
    }, 2000);
});

const chatContainer = document.getElementById("chat-container");
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=YOUR_API_KEY";

async function sendMessage() {
    const textInput = document.getElementById("text-prompt");
    const imageInput = document.getElementById("image-input");

    const userText = textInput.value.trim();
    if (!userText && !imageInput.files.length) return;

    addMessage("user", userText || "[Image]");

    const reader = imageInput.files.length
        ? await readFileAsBase64(imageInput.files[0])
        : null;

    const parts = [];
    if (userText) parts.push({ text: userText });
    if (reader) parts.push({
        inline_data: {
            mime_type: imageInput.files[0].type,
            data: reader
        }
    });

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts }] })
    });

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply.";
    addMessage("bot", reply);

    textInput.value = "";
    imageInput.value = "";
}

function addMessage(sender, message) {
    const msg = document.createElement("div");
    msg.className = sender === "user" ? "user-msg" : "bot-msg";
    msg.innerText = message;
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

function startVoice() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onresult = function (event) {
        document.getElementById("text-prompt").value = event.results[0][0].transcript;
        sendMessage();
    };
    recognition.start();
}
