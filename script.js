let chatbox = document.getElementById("chatbox");
let isSpeaking = false;  // Flag to track if speech is currently happening
let currentSpeech = null;  // Holds the current speech instance
let textToSpeak = "";  // The full text to be spoken
let spokenText = "";  // Text that has already been spoken
let currentIndex = 0;  // The index from where speech needs to continue

// Function to send a message to the chatbot and get a response
function sendMessage() {
    let userMessage = document.getElementById("user_input").value.trim();
    if (!userMessage) return;

    chatbox.innerHTML += `<p class='user'><b>You:</b> ${userMessage}</p>`;
    document.getElementById("user_input").value = "";

    fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
        chatbox.innerHTML += `<p class='bot'><b>Bot:</b> ${data.reply}</p>`;
        chatbox.scrollTop = chatbox.scrollHeight;
        textToSpeak = data.reply;  // Store the response to speak
        spokenText = "";  // Reset spoken text tracker
        currentIndex = 0;  // Reset index
    })
    .catch(error => console.error("Fetch Error:", error));
}

// Function to handle the speaking of the chatbot's response when the button is clicked
function speakChatbotResponse() {
    if (isSpeaking) {
        stopSpeaking();  // Pause speech if already speaking
    } else {
        if (!textToSpeak) {
            alert("❌ No response from the bot to speak.");
            return;
        }

        // Speak from where it left off or start a new speech
        speakResponse(textToSpeak);
    }
}

// Function to handle the actual speaking of the text
function speakResponse(text) {
    let speech = new SpeechSynthesisUtterance(text.slice(currentIndex));  // Start from where it left off
    speech.rate = 1; // Adjust speech rate (optional)
    speech.pitch = 1; // Adjust pitch (optional)
    speech.voice = speechSynthesis.getVoices()[0]; // Set voice (optional)

    // Mark as speaking
    isSpeaking = true;

    // Start speaking the speech
    speechSynthesis.speak(speech);

    // Store the current speech instance to handle pause/resume
    currentSpeech = speech;

    // When speech ends, update flags and spokenText
    speech.onend = function() {
        spokenText = text;  // Mark the entire text as spoken
        currentIndex = text.length;  // Update index to the end of the text
        isSpeaking = false;
        currentSpeech = null;
    };
}

// Function to pause speech (cancel ongoing speech)
function stopSpeaking() {
    if (currentSpeech) {
        speechSynthesis.cancel();  // Pause the current speech
        isSpeaking = false;  // Update speaking status
        currentSpeech = null;  // Clear current speech object
    }
}

// Speech recognition setup (if needed)
let recognition;
if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
} else {
    alert("❌ Your browser does not support Speech Recognition. Try using Google Chrome.");
}

if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = function(event) {
        let voiceInput = event.results[0][0].transcript;
        document.getElementById("user_input").value = voiceInput;
        sendMessage(); // Auto-send message after speech input
    };

    recognition.onerror = function(event) {
        console.error("Speech Recognition Error:", event.error);
        alert("❌ Speech recognition error: " + event.error);
    };

    recognition.onend = function() {
        console.log("Speech recognition stopped.");
    };
}

// Function to start listening for voice input
function startListening() {
    if (recognition) {
        recognition.start();
    } else {
        alert("❌ Speech Recognition is not available.");
    }
}
