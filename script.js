let sendMessage;

document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatWindow = document.getElementById('chat-window');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendMessage = function() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user-message');
            userInput.value = '';
            showSpinner();
            getJesusResponse(message);
        }
    };

    function addMessage(content, className) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', className);
        messageElement.textContent = content;
        messagesContainer.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function showSpinner() {
        document.getElementById('spinner').classList.remove('hidden');
    }

    function hideSpinner() {
        document.getElementById('spinner').classList.add('hidden');
    }

    async function getJesusResponse(userMessage) {
        if (!apiKey) {
            hideSpinner();
            alert('Please enter your OpenAI API key');
            apiKeyModal.style.display = 'block';
            return;
        }

        conversationHistory.push({role: "user", content: userMessage});

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {role: "system", content: "You are Jesus, answering questions based on biblical texts. Every answer should have a foundation in the bible."},
                        ...conversationHistory
                    ]
                })
            });

            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                const jesusResponse = data.choices[0].message.content;
                conversationHistory.push({role: "assistant", content: jesusResponse});
                addMessage(jesusResponse, 'jesus-message');
            } else {
                throw new Error('No response from API');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, I encountered an error. Please try again later.', 'jesus-message');
        } finally {
            hideSpinner();
        }
    }
});

const apiKeyModal = document.getElementById('api-key-modal');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyButton = document.getElementById('save-api-key');

let apiKey = localStorage.getItem('openai_api_key');
let conversationHistory = [];

if (!apiKey) {
    apiKeyModal.style.display = 'block';
}

saveApiKeyButton.addEventListener('click', () => {
    apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('openai_api_key', apiKey);
        apiKeyModal.style.display = 'none';
    } else {
        alert('Please enter a valid API key');
    }
});

document.querySelectorAll('.example-questions li').forEach(item => {
    item.addEventListener('click', event => {
        const question = event.target.textContent;
        document.getElementById('user-input').value = question;
        sendMessage();
    });
});
