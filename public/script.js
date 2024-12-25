const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatlog = document.getElementById('chatlog');

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    // Menambahkan pesan pengguna ke chatlog
    addMessageToChatlog('User: ' + message, 'user');
    
    // Mengosongkan input
    userInput.value = '';

    // Kirim ke server Node.js yang akan mengirimkan ke API Gemini
    getGeminiResponse(message);
}

function addMessageToChatlog(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    messageElement.textContent = message;
    chatlog.appendChild(messageElement);
    chatlog.scrollTop = chatlog.scrollHeight; // Scroll ke bawah
}

async function getGeminiResponse(message) {
    // Menambahkan indikator mengetik
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatlog.appendChild(typingIndicator);
    chatlog.scrollTop = chatlog.scrollHeight;

    // Simulasi penundaan untuk efek mengetik
    setTimeout(async () => {
        typingIndicator.style.display = 'none'; // Sembunyikan indikator mengetik

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            if (data.reply) {
                addMessageToChatlog('Chatbot: ' + data.reply, 'bot');
            } else {
                addMessageToChatlog('Gemini: Sorry, I didn\'t understand that.', 'bot');
            }
        } catch (error) {
            addMessageToChatlog('Gemini: Error communicating with the server.', 'bot');
            console.error(error);
        }
    }, 100); // Durasi mengetik, bisa disesuaikan
}
