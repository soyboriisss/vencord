import React, { useEffect } from '@webpack/common'; // Use @webpack/common for React

let autoReplyMessage = null; // Changed to 'let' for mutability
let lastSender = null;

function definePluginSettings(settings: any) {
    return settings;
}

const settings = definePluginSettings({
    autoReplyMessage: {
        type: "STRING",
        description: "Set the default auto-reply message.",
        restartNeeded: false,
        default: "Hello, I am currently unavailable. I will reply shortly."
    }
});

function sendMessage(content: string): void {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    
    textarea.focus();
    textarea.value = content;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    
    const sendButton = document.querySelector('[aria-label="Send Message"]') as HTMLButtonElement;
    if (sendButton) sendButton.click();
}

document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
        setTimeout(() => {
            const messages = document.querySelectorAll("[data-list-item-id]");
            if (messages.length === 0) return;
            
            const lastMessage = messages[messages.length - 1] as HTMLElement;
            const usernameElement = lastMessage.querySelector("h3") as HTMLElement | null;
            const contentElement = lastMessage.querySelector("div[dir='auto']") as HTMLElement | null;
            
            if (!usernameElement || !contentElement) return;
            
            const username = usernameElement.innerText;
            const content = contentElement.innerText;
            
            if (content.startsWith("`start ")) {
                autoReplyMessage = content.replace("`start ", "");
                lastSender = username;
                lastMessage.remove(); // Delete the start message
            }
            
            if (content === "`stop") {
                autoReplyMessage = null;
                lastSender = null;
                lastMessage.remove(); // Delete the stop message
            }
        }, 100);
    }
});

document.addEventListener("DOMNodeInserted", (event: Event) => {
    if (!autoReplyMessage || !lastSender) return;
    
    const messages = document.querySelectorAll("[data-list-item-id]");
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1] as HTMLElement;
    const usernameElement = lastMessage.querySelector("h3") as HTMLElement | null;
    
    if (!usernameElement) return;
    
    const username = usernameElement.innerText;
    
    if (username === lastSender) {
        sendMessage(autoReplyMessage);
    }
});

const AutoReplyPlugin = () => {
    const { autoReplyMessage } = settings;

    useEffect(() => {
        const handleNewMessage = () => {
            const messages = document.querySelectorAll("[data-list-item-id]");
            if (messages.length === 0) return;
            
            const lastMessage = messages[messages.length - 1] as HTMLElement;
            const usernameElement = lastMessage.querySelector("h3") as HTMLElement | null;
            const contentElement = lastMessage.querySelector("div[dir='auto']") as HTMLElement | null;
            
            if (usernameElement && contentElement) {
                const username = usernameElement.innerText;
                const content = contentElement.innerText;

                if (content.startsWith("`start ")) {
                    autoReplyMessage = content.replace("`start ", "");
                    lastSender = username;
                    lastMessage.remove(); // Delete start message
                }

                if (content === "`stop") {
                    autoReplyMessage = null;
                    lastSender = null;
                    lastMessage.remove(); // Delete stop message
                }

                if (autoReplyMessage && username !== lastSender) {
                    sendMessage(autoReplyMessage);
                }
            }
        };

        document.addEventListener("DOMNodeInserted", handleNewMessage);

        return () => {
            document.removeEventListener("DOMNodeInserted", handleNewMessage);
        };
    }, [autoReplyMessage]);

    return (
        <div>
            <h3>Auto Reply Plugin Active</h3>
            <p>Replies with a custom message when a message starts with `start &lt;message&gt;`.</p>
        </div>
    );
};

export default AutoReplyPlugin;
