const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatbot = document.querySelector('.chatbot');
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `  <span><img src="https://img.icons8.com/?size=256&id=37410&format=png" alt=""></span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

const generateResponse = async (chatElement) => {
    // Extract the user message from the <p> element
    const outgoingMessages = document.querySelectorAll(".outgoing p");
    const messageElement = chatElement.querySelector("p");
    // Select the last outgoing message (latest one)
    const latestOutgoingMessage = outgoingMessages[outgoingMessages.length - 1]?.textContent;

    const API_URL = `https://nodejs-chat-fi0c.onrender.com/gemini/${encodeURIComponent(latestOutgoingMessage)}`;

    fetch(API_URL).then(res => res.json()).then(data => {
        messageElement.textContent = data.trim();
    }).catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));

};

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if (!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("generating responses...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

function hideChatbot() {

}

// Function to check if the click was outside the chatbot
function handleClick(event) {
    // Check if the click happened inside the chatbot
    if (chatbot.contains(event.target)) {
        console.log("Click inside the chatbot.");
        // Here, you can keep the chatbot open or handle the internal click
    } else {
        document.body.classList.remove("show-chatbot")

        // Here, you can close the chatbot if the click was outside
    }
}

// Add event listener to detect clicks outside of the chatbot
document.addEventListener('click', handleClick);

chatbotToggler.addEventListener('click', function(event) {
    event.stopPropagation(); // Prevent this click from propagating to the document listener
    // Toggle chatbot visibility here
    chatbot.classList.toggle('show-chatbot');
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", ( ) => document.body.classList.toggle("show-chatbot"));
