import { Menu } from "@webpack/common";
import { definePluginSettings } from "@api/Settings";
import { classes } from "@utils/misc";
import { find } from "@webpack";
import { Toasts } from "@webpack/common";
import { UserStore } from "@webpack/common";
import definePlugin from "@utils/types";
import React, { useState, useEffect } from "react";

let autoReplyMessage: string | null = null;
let lastSender: string | null = null;

const settings = definePluginSettings({
    autoReplyEnabled: {
        type: "BOOLEAN",
        description: "Enable auto-reply functionality",
        restartNeeded: false,
        default: true,
    },
    autoReplyMessage: {
        type: "STRING",
        description: "Message to auto-reply with",
        restartNeeded: false,
        default: "I am currently away, I'll get back to you soon!",
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

function handleMessages(event: Event) {
    if (!settings.store.autoReplyEnabled || !autoReplyMessage || !lastSender) return;

    const messages = document.querySelectorAll("[data-list-item-id]");
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1] as HTMLElement;
    const usernameElement = lastMessage.querySelector("h3") as HTMLElement | null;

    if (!usernameElement) return;

    const username = usernameElement.innerText;

    if (username === lastSender) {
        sendMessage(autoReplyMessage);
    }
}

function processIncomingMessages(event: KeyboardEvent) {
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
                lastMessage.remove(); // Remove the start message
            }

            if (content === "`stop") {
                autoReplyMessage = null;
                lastSender = null;
                lastMessage.remove(); // Remove the stop message
            }
        }, 100);
    }
}

const AutoReplyIndicator = () => {
    const [message, setMessage] = useState(autoReplyMessage);
    const [sender, setSender] = useState(lastSender);

    useEffect(() => {
        document.addEventListener("keydown", processIncomingMessages);
        document.addEventListener("DOMNodeInserted", handleMessages);

        return () => {
            document.removeEventListener("keydown", processIncomingMessages);
            document.removeEventListener("DOMNodeInserted", handleMessages);
        };
    }, []);

    return (
        <Menu.MenuGroup>
            <Menu.MenuItem
                id="auto-reply-toggle"
                label={message ? "Disable Auto-Reply" : "Enable Auto-Reply"}
                action={() => {
                    if (message) {
                        autoReplyMessage = null;
                        lastSender = null;
                        Toasts.show({ message: "Auto-reply disabled", type: Toasts.Type.SUCCESS });
                    } else {
                        autoReplyMessage = settings.store.autoReplyMessage;
                        Toasts.show({ message: "Auto-reply enabled", type: Toasts.Type.SUCCESS });
                    }
                }}
            />
        </Menu.MenuGroup>
    );
};

export default definePlugin({
    name: "AutoReply",
    description: "Automatically replies to messages based on user-defined content.",
    authors: ["Your Name"],

    settings,

    contextMenus: {
        "user-context": AutoReplyIndicator,
    },

    flux: {
        MESSAGE_CREATE({ message }: { message: string }) {
            if (message === "`stop") {
                autoReplyMessage = null;
                lastSender = null;
            }
        }
    },

    patches: [
        // You can add additional patches if required
    ]
});
