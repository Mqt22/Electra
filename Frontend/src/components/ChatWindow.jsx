import React, { useEffect, useRef, useState } from "react";
import { RiRobot2Line } from "react-icons/ri";

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef(null);

  // Create one conversation ID and keep it for this user
  const [conversationId] = useState(() => {
    const savedId = localStorage.getItem("chatbot_conversation_id");

    if (savedId) {
      return savedId;
    }

    const newId = crypto.randomUUID();
    localStorage.setItem("chatbot_conversation_id", newId);

    return newId;
  });

  // Load previous chat history from MySQL
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/chatbot/${conversationId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load chat history");
        }

        const data = await response.json();

        const history = [];

        data.forEach((chat) => {
          history.push({
            role: "user",
            content: chat.message,
          });

          history.push({
            role: "assistant",
            content: chat.response,
          });
        });

        setMessages(history);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadChatHistory();
  }, [conversationId]);

  // Automatically scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isThinking) return;

    setMessage("");
    setIsThinking(true);

    try {
      const response = await fetch("http://localhost:8000/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: trimmedMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get chatbot response");
      }

      const data = await response.json();

      // /clear command
      if (trimmedMessage.toLowerCase() === "/clear") {
        if (data.cleared === true) {
          setMessages([]);
        }

        return;
      }

      // Add user's normal message
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: trimmedMessage,
        },
      ]);

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the assistant right now. Please try again.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          className="
            fixed bottom-4 right-4 sm:bottom-6 sm:right-6
            z-[9999]
            flex h-14 w-14 sm:h-16 sm:w-16
            items-center justify-center
            rounded-full bg-gray-900 text-white
            shadow-xl
            transition-all duration-300
            hover:scale-110 hover:bg-gray-800
            animate-bounce
          "
        >
          <RiRobot2Line className="text-2xl sm:text-3xl" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="
            fixed z-[9999]

            /* Mobile */
            inset-x-2 bottom-2
            h-[calc(100dvh-1rem)]

            /* Small devices */
            sm:left-auto
            sm:right-4
            sm:bottom-4
            sm:inset-x-auto
            sm:h-[600px]
            sm:w-[380px]

            /* Medium and larger */
            md:right-6
            md:bottom-6
            md:h-[600px]
            md:w-[400px]

            /* Prevent it from becoming huge */
            max-h-[calc(100dvh-1rem)]
            max-w-[calc(100vw-1rem)]

            flex flex-col
            overflow-hidden
            rounded-2xl
            border border-gray-200
            bg-white
            shadow-2xl
          "
        >
          {/* Header */}
          <div
            className="
              flex shrink-0
              items-center justify-between
              bg-gray-900
              px-4 py-3 sm:px-5 sm:py-4
              text-white
            "
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <RiRobot2Line className="shrink-0 text-xl" />

                <h3 className="truncate text-sm font-semibold sm:text-base">
                  AI Assistant
                </h3>
              </div>

              <p className="mt-0.5 truncate text-xs text-gray-300 sm:text-sm">
                Ask me about our products
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Assistant"
              className="
                ml-3 shrink-0
                px-1
                text-2xl leading-none
                text-gray-300
                transition
                hover:text-white
              "
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              bg-gray-50
              p-3 sm:p-4
            "
          >
            {/* Welcome message */}
            {messages.length === 0 && (
              <div
                className="
                  flex h-full
                  items-center justify-center
                  px-4 sm:px-6
                  text-center
                "
              >
                <div>
                  <div className="mb-3 flex justify-center">
                    <RiRobot2Line className="text-4xl text-gray-700 sm:text-5xl" />
                  </div>

                  <h4 className="text-base font-semibold text-gray-900 sm:text-lg">
                    How can I help?
                  </h4>

                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Ask me about our products, prices, ratings, or
                    availability.
                  </p>

                  <p className="mt-4 text-xs text-gray-400">
                    Type /clear to clear this conversation
                  </p>
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 flex ${msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
                  }`}
              >
                <div
                  className={`
                    max-w-[85%] sm:max-w-[80%]
                    rounded-2xl
                    px-3 py-2.5 sm:px-3.5
                    text-sm
                    leading-relaxed
                    whitespace-pre-wrap
                    break-words
                    ${msg.role === "user"
                      ? "rounded-br-sm bg-gray-900 text-white"
                      : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                    }
                  `}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Thinking animation */}
            {isThinking && (
              <div className="mb-3 flex justify-start">
                <div
                  className="
                    flex items-center gap-1
                    rounded-2xl rounded-bl-sm
                    border border-gray-200
                    bg-white
                    px-4 py-3
                  "
                >
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />

                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "150ms" }}
                  />

                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="
              flex shrink-0
              gap-2
              border-t border-gray-200
              bg-white
              p-2.5 sm:p-3
            "
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a product..."
              rows={1}
              disabled={isThinking}
              className="
                min-h-[42px]
                max-h-28
                min-w-0
                flex-1
                resize-none
                rounded-xl
                border border-gray-300
                px-3 py-2.5
                text-sm
                text-gray-900
                outline-none
                placeholder:text-gray-400
                focus:border-gray-900
                disabled:bg-gray-100
              "
            />

            <button
              onClick={sendMessage}
              disabled={!message.trim() || isThinking}
              aria-label="Send message"
              className="
                h-[42px]
                w-[42px]
                shrink-0
                rounded-xl
                bg-gray-900
                text-white
                transition
                hover:bg-gray-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWindow;