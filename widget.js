window.ChatWidget = {
    init: function(config) {
        const API_URL = config.apiUrl || "http://localhost:8000/chat";
        const BOT_NAME = config.botName || "AI Assistant";
        const WELCOME_MSG = config.welcomeMessage || "Hello! How can I help you today?";

        // Inject Styles (Premium Modern Glassmorphism & Micro-animations)
        const style = document.createElement('style');
        style.innerHTML = `
            :root {
                --cw-primary: #4F46E5;
                --cw-secondary: #6366F1;
                --cw-glass-bg: rgba(255, 255, 255, 0.85);
                --cw-text-main: #1E293B;
                --cw-text-muted: #64748B;
            }

            #cw-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }

            #cw-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--cw-primary), var(--cw-secondary));
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            #cw-toggle:hover {
                transform: scale(1.08) translateY(-2px);
                box-shadow: 0 15px 35px rgba(79, 70, 229, 0.5);
            }

            #cw-toggle svg {
                width: 32px;
                height: 32px;
                fill: currentColor;
                transition: transform 0.3s ease;
            }

            .cw-open #cw-toggle {
                transform: rotate(90deg) scale(0);
                opacity: 0;
                pointer-events: none;
            }

            #cw-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 380px;
                height: 600px;
                max-height: calc(100vh - 120px);
                max-width: calc(100vw - 48px);
                background: var(--cw-glass-bg);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.6);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform-origin: bottom right;
                transform: scale(0.8) translateY(20px);
                opacity: 0;
                pointer-events: none;
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
            }

            .cw-open #cw-window {
                transform: scale(1) translateY(0);
                opacity: 1;
                pointer-events: all;
            }

            #cw-header {
                background: linear-gradient(135deg, var(--cw-primary), var(--cw-secondary));
                padding: 20px 24px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top-left-radius: 24px;
                border-top-right-radius: 24px;
                flex-shrink: 0;
            }

            .cw-header-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .cw-avatar {
                width: 42px;
                height: 42px;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                position: relative;
            }

            .cw-avatar::after {
                content: '';
                position: absolute;
                bottom: 0px;
                right: 0px;
                width: 10px;
                height: 10px;
                background-color: #22c55e;
                border: 2px solid var(--cw-primary);
                border-radius: 50%;
            }

            .cw-info h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                line-height: 1.2;
            }

            .cw-info p {
                margin: 4px 0 0;
                font-size: 12px;
                opacity: 0.9;
            }

            #cw-close {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                cursor: pointer;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s ease, transform 0.2s ease;
            }

            #cw-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }

            #cw-messages {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                scroll-behavior: smooth;
            }

            #cw-messages::-webkit-scrollbar { width: 6px; }
            #cw-messages::-webkit-scrollbar-track { background: transparent; }
            #cw-messages::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 10px; }

            .cw-message {
                max-width: 85%;
                padding: 14px 18px;
                border-radius: 20px;
                font-size: 14px;
                line-height: 1.5;
                animation: cw-msg-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                opacity: 0;
                transform: translateY(10px);
                word-wrap: break-word;
            }

            @keyframes cw-msg-enter {
                to { opacity: 1; transform: translateY(0); }
            }

            .cw-message.bot {
                background: #F1F5F9;
                color: var(--cw-text-main);
                align-self: flex-start;
                border-bottom-left-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }

            .cw-message.user {
                background: linear-gradient(135deg, var(--cw-primary), var(--cw-secondary));
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
                box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
            }

            .cw-message.loading {
                display: flex;
                gap: 6px;
                align-items: center;
                padding: 16px 20px;
            }

            .cw-dot {
                width: 6px;
                height: 6px;
                background-color: #94A3B8;
                border-radius: 50%;
                animation: cw-typing 1.4s infinite ease-in-out both;
            }

            .cw-dot:nth-child(1) { animation-delay: -0.32s; }
            .cw-dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes cw-typing {
                0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }

            #cw-input-area {
                padding: 20px;
                background: rgba(255, 255, 255, 0.9);
                border-top: 1px solid rgba(226, 248, 240, 0.5);
                flex-shrink: 0;
            }

            .cw-input-wrapper {
                display: flex;
                align-items: center;
                background: #F8FAFC;
                border: 1px solid #E2E8F0;
                border-radius: 30px;
                padding: 6px 6px 6px 20px;
                transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
            }

            .cw-input-wrapper:focus-within {
                border-color: var(--cw-secondary);
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                background: white;
            }

            #cw-input {
                flex: 1;
                border: none;
                background: transparent;
                padding: 10px 0;
                font-size: 14.5px;
                font-family: inherit;
                color: var(--cw-text-main);
                outline: none;
            }

            #cw-input::placeholder { color: #94A3B8; }

            #cw-send {
                background: var(--cw-primary);
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease;
            }

            #cw-send:hover {
                transform: scale(1.1);
                background: var(--cw-secondary);
            }

            #cw-send:active { transform: scale(0.95); }

            #cw-send:disabled {
                background: #CBD5E1;
                cursor: not-allowed;
                transform: none;
            }
            
            #cw-send svg {
                width: 18px;
                height: 18px;
                fill: white;
                margin-left: 2px;
            }
            
            .cw-footer {
                text-align: center;
                font-size: 11px;
                color: #94A3B8;
                margin-top: 14px;
                margin-bottom: -4px;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);

        // Inject DOM
        const container = document.createElement("div");
        container.id = "cw-container";
        
        container.innerHTML = `
            <div id="cw-window">
                <div id="cw-header">
                    <div class="cw-header-title">
                        <div class="cw-avatar">🤖</div>
                        <div class="cw-info">
                            <h3>${BOT_NAME}</h3>
                            <p>Online & Ready</p>
                        </div>
                    </div>
                    <button id="cw-close" aria-label="Close chat">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div id="cw-messages"></div>
                <div id="cw-input-area">
                    <div class="cw-input-wrapper">
                        <input type="text" id="cw-input" placeholder="Type your message..." autocomplete="off"/>
                        <button id="cw-send" aria-label="Send message">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="cw-footer">⚡ Powered by Ashok's Intelligence</div>
                </div>
            </div>
            <button id="cw-toggle" aria-label="Open chat">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
            </button>
        `;

        document.body.appendChild(container);

        // Logic
        const toggleBtn = document.getElementById("cw-toggle");
        const closeBtn = document.getElementById("cw-close");
        const windowEl = document.getElementById("cw-window");
        const input = document.getElementById("cw-input");
        const sendBtn = document.getElementById("cw-send");
        const messages = document.getElementById("cw-messages");

        let isOpen = false;

        const toggleWidget = () => {
            isOpen = !isOpen;
            if (isOpen) {
                container.classList.add('cw-open');
                if (messages.children.length === 0) {
                    addMessage(WELCOME_MSG, "bot");
                }
                setTimeout(() => input.focus(), 300);
            } else {
                container.classList.remove('cw-open');
            }
        };

        toggleBtn.addEventListener('click', toggleWidget);
        closeBtn.addEventListener('click', toggleWidget);

        const appendDOM = (el) => {
            messages.appendChild(el);
            messages.scrollTop = messages.scrollHeight;
        };

        const addMessage = (text, sender) => {
            const div = document.createElement("div");
            div.className = "cw-message " + sender;
            div.innerText = text;
            appendDOM(div);
            return div;
        };

        const addLoading = () => {
            const div = document.createElement("div");
            div.className = "cw-message bot loading";
            div.innerHTML = '<div class="cw-dot"></div><div class="cw-dot"></div><div class="cw-dot"></div>';
            appendDOM(div);
            return div;
        };

        const handleSend = async () => {
            const message = input.value.trim();
            if (!message) return;

            addMessage(message, "user");
            input.value = "";
            input.disabled = true;
            sendBtn.disabled = true;
            
            const loadingEl = addLoading();

            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ message })
                });
                
                if (!res.ok) throw new Error("Network response was not ok");
                
                const data = await res.json();
                messages.removeChild(loadingEl);
                addMessage(data.reply || "I'm having trouble thinking right now.", "bot");

            } catch (err) {
                messages.removeChild(loadingEl);
                addMessage("Oops! Servers seem to be down or unreachable. Try again later.", "bot");
            } finally {
                input.disabled = false;
                sendBtn.disabled = false;
                input.focus();
            }
        };

        sendBtn.addEventListener('click', handleSend);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
            }
        });
    }
};
