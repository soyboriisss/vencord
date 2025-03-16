import React, { useEffect } from 'react';

// Replaced const with let
let autoReplyMessage: string | null = null; // Use let to allow reassignment
let lastSender: string | null = null;

// Define the function for plugin settings (custom or imported)
function definePluginSettings(settings: any) {
    // Example definition for settings
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

// Function to send message to the textarea
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
    const { autoReplyMessage } = settings; // Direct access to settings

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
            <p>Replies with a custom message when a message starts with `start <message>`.</p>
        </div>
    );
};

export default AutoReplyPlugin;
