let autoReplyMessage = null;
let lastSender = null;

function sendMessage(content) {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;
    
    textarea.focus();
    textarea.value = content;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    
    const sendButton = document.querySelector('[aria-label="Send Message"]');
    if (sendButton) sendButton.click();
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        setTimeout(() => {
            const messages = document.querySelectorAll("[data-list-item-id]");
            if (messages.length === 0) return;
            
            const lastMessage = messages[messages.length - 1];
            const username = lastMessage.querySelector("h3").innerText;
            const content = lastMessage.querySelector("div[dir='auto']").innerText;
            
            if (content.startsWith("`start ")) {
                autoReplyMessage = content.replace("`start ", "");
                lastSender = username;
                lastMessage.remove(); // Borra el mensaje de inicio
            }
            
            if (content === "`stop") {
                autoReplyMessage = null;
                lastSender = null;
                lastMessage.remove(); // Borra el mensaje de stop
            }
        }, 100);
    }
});

document.addEventListener("DOMNodeInserted", (event) => {
    if (!autoReplyMessage || !lastSender) return;
    
    const messages = document.querySelectorAll("[data-list-item-id]");
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    const username = lastMessage.querySelector("h3").innerText;
    
    if (username === lastSender) {
        sendMessage(autoReplyMessage);
    }
});
