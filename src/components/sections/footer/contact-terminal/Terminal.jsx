import { useCallback, useEffect, useRef, useState } from "react";
import "./terminal.css";

// Terminal directory display component
function Directory({ user, host, path }) {
  return (
    <>
      <span className="flex">
        <span className="text-emerald-400">{user}</span>
        <span className="text-gray-400">@</span>
        <span className="text-sky-400">{host}</span>
        <span className="text-gray-400">:</span>
      </span>
      <span className="flex">
        <span className="text-fuchsia-400">~/{path}</span>
        <span className="text-gray-400">$</span>
      </span>
    </>
  );
}

export default function Terminal() {
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commandBuffer, setCommandBuffer] = useState([]);
  const [bufferPosition, setBufferPosition] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const promptRef = useRef(null);

  // Command definitions
  const COMMANDS = [
    {
      name: "send",
      description: "Sends an email message to Ehsan Khan",
      usage: "send <email> <message>",
      handler: async (args) => {
        if (args.length < 2) {
          return {
            type: "error",
            content:
              "Error: 'send' command requires both email and message arguments.\nUsage: send <email> <message>",
          };
        }

        const email = args[0];
        const message = args.slice(1).join(" ").trim();

        // Message validation
        if (!message) {
          return {
            type: "error",
            content: "Error: Message cannot be empty.",
          };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return {
            type: "error",
            content: `Error: Invalid email format '${email}'`,
          };
        }

        // Send message via API
        setIsLoading(true);
        try {
          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: "ehsan18t@gmail.com",
              subject: `Contact Form: ${email}`,
              html: `
                <h1>New contact form submission</h1>
                <p><strong>From:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
              `,
              text: `New contact form submission\nFrom: ${email}\nMessage: ${message}`,
            }),
          });

          const data = await response.json();

          setIsLoading(false);
          return {
            type: "success",
            content: `Message sent successfully to Ehsan`,
          };
        } catch (error) {
          setIsLoading(false);
          return {
            type: "error",
            content: `Error sending message: ${error.message || "Network error"}`,
          };
        }
      },
    },
    {
      name: "man",
      description: "Display manual for a command",
      usage: "man <command>",
      handler: (args) => {
        const commandName = args[0]?.toLowerCase();

        if (!commandName) {
          return {
            type: "error",
            content: "What manual page do you want?\nFor example: 'man send'",
          };
        }

        const command = COMMANDS.find((cmd) => cmd.name === commandName);

        if (!command) {
          return {
            type: "error",
            content: `No manual entry for '${commandName}'\n\nSupported commands: ${COMMANDS.map((c) => c.name).join(", ")}`,
          };
        }

        return {
          type: "manual",
          content: `COMMAND: ${command.name}
USAGE: ${command.usage}
DESCRIPTION: 
  ${command.description}
  
${
  command.name === "send"
    ? `PARAMETERS:
  <email>    - Your email address (required)
  <message>  - The message content (required)
  
EXAMPLES:
  send user@example.com Hello, I'd like to hire you for a project.
  send contact@domain.com I'd like to discuss a project opportunity.`
    : ""
}`,
        };
      },
    },
    {
      name: "clear",
      description: "Clears the terminal screen",
      usage: "clear",
      handler: () => {
        setCommandHistory([]);
        return null; // No response needed
      },
    },
    {
      name: "help",
      description: "Displays available commands and basic usage information",
      usage: "help",
      handler: () => {
        return {
          type: "info",
          content: `Available commands:\n\n${COMMANDS.map(
            (cmd) => `${cmd.name.padEnd(10)} - ${cmd.description}`,
          ).join(
            "\n",
          )}\n\nType 'man <command>' for more detailed information about a command.`,
        };
      },
    },
  ];

  // Focus the input when terminal is clicked
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory, isLoading]);

  // Run the default 'man send' command on initial render
  useEffect(() => {
    executeCommand("man send", false);
  }, []);

  // Adjust the position of the visible input
  useEffect(() => {
    adjustInputPosition();
  }, [currentInput, isLoading]);

  // Adjust the position of the visible input element
  const adjustInputPosition = () => {
    if (promptRef.current && inputRef.current) {
      const promptWidth = promptRef.current.offsetWidth;
      inputRef.current.style.paddingLeft = `${promptWidth + 8}px`; // 8px for margin
    }
  };

  const addToCommandBuffer = useCallback(
    (command) => {
      if (
        command.trim() &&
        (commandBuffer.length === 0 || commandBuffer[0] !== command)
      ) {
        setCommandBuffer((prev) => [command, ...prev.slice(0, 19)]);
      }
      setBufferPosition(-1);
    },
    [commandBuffer],
  );

  const handleKeyPress = useCallback(
    (e) => {
      // Prevent terminal scrolling on spacebar
      if (e.key === " " && e.target === inputRef.current) {
        e.stopPropagation();
      }

      if (e.key === "Enter" && currentInput.trim()) {
        e.preventDefault();
        executeCommand(currentInput.trim(), true);
        setCurrentInput("");
      } else if (e.key === "ArrowUp" && !e.ctrlKey) {
        e.preventDefault();
        if (commandBuffer.length > 0) {
          const newPosition = Math.min(
            bufferPosition + 1,
            commandBuffer.length - 1,
          );
          setBufferPosition(newPosition);
          setCurrentInput(commandBuffer[newPosition]);

          // Move cursor to end of input after delay
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = inputRef.current.value.length;
              inputRef.current.selectionEnd = inputRef.current.value.length;
            }
          }, 0);
        }
      } else if (e.key === "ArrowDown" && !e.ctrlKey) {
        e.preventDefault();
        if (bufferPosition > 0) {
          const newPosition = bufferPosition - 1;
          setBufferPosition(newPosition);
          setCurrentInput(commandBuffer[newPosition]);
        } else if (bufferPosition === 0) {
          setBufferPosition(-1);
          setCurrentInput("");
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        const input = currentInput.toLowerCase();
        if (!input) return;

        const matchingCommand = COMMANDS.find((cmd) =>
          cmd.name.startsWith(input),
        );
        if (matchingCommand) {
          setCurrentInput(matchingCommand.name + " ");
        } else if (input === "man ") {
          setCurrentInput("man send");
        }
      } else if (e.key === "c" && e.ctrlKey) {
        e.preventDefault();
        if (isLoading) {
          setIsLoading(false);
          setCommandHistory((prev) => [
            ...prev,
            {
              type: "error",
              content: "Operation canceled by user.",
            },
          ]);
        } else {
          setCurrentInput("");
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setCommandHistory([]);
      }
    },
    [currentInput, commandBuffer, bufferPosition, isLoading],
  );

  const executeCommand = useCallback(
    async (commandInput, addToBuffer = true) => {
      if (addToBuffer) {
        addToCommandBuffer(commandInput);
      }

      const newEntry = {
        type: "command",
        content: commandInput,
      };

      setCommandHistory((prev) => [...prev, newEntry]);

      const parts = commandInput.trim().split(" ");
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      const command = COMMANDS.find((c) => c.name === cmd);
      if (command) {
        const result = await command.handler(args);
        if (result) {
          setCommandHistory((prev) => [...prev, result]);
        }
      } else {
        setCommandHistory((prev) => [
          ...prev,
          {
            type: "error",
            content: `Command not found: ${cmd}\n            
Type 'help' to see available commands.`,
          },
        ]);
      }
    },
    [addToCommandBuffer],
  );

  return (
    <div
      className="mx-auto max-w-[680px] rounded-lg overflow-hidden terminal-container"
      onClick={focusInput}
      aria-label="Interactive terminal"
      role="region"
    >
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="flex items-center">
          <div className="terminal-btn terminal-close"></div>
          <div className="terminal-btn terminal-minimize"></div>
          <div className="terminal-btn terminal-maximize"></div>
        </div>
        <div className="terminal-title">user@mac: ~/contact</div>
        <div className="terminal-menu">⌘</div>
      </div>

      {/* Terminal Content with Scrollbar */}
      <div ref={terminalRef} className="terminal-content" aria-live="polite">
        {/* Command history and responses */}
        {commandHistory.map((entry, index) => (
          <div key={index}>
            {entry.type === "command" && (
              <div className="mb-2 flex gap-1 items-center prompt-line">
                <Directory user="user" host="mac" path="contact" />
                <span className="ml-1 command-input">{entry.content}</span>
              </div>
            )}

            {entry.type === "error" && (
              <div className="terminal-message error-message">
                <div className="whitespace-pre-line">{entry.content}</div>
              </div>
            )}

            {entry.type === "success" && (
              <div className="terminal-message success-message">
                <div>{entry.content}</div>
              </div>
            )}

            {entry.type === "info" && (
              <div className="terminal-message info-message">
                <div className="whitespace-pre-line">{entry.content}</div>
              </div>
            )}

            {entry.type === "manual" && (
              <div className="terminal-message manual-message">
                <div className="whitespace-pre-line">{entry.content}</div>
              </div>
            )}
          </div>
        ))}

        {/* Active prompt line with visible input */}
        <div className={`active-prompt-line ${isLoading ? "loading" : ""}`}>
          {isLoading ? (
            <>
              <div className="loading-line">
                <div className="loading-spinner"></div>
                <span className="loading-text">Processing command...</span>
              </div>
            </>
          ) : (
            <>
              <div className="prompt-container" ref={promptRef}>
                <Directory user="user" host="mac" path="contact" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="terminal-input"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                aria-label="Terminal input"
              />
            </>
          )}
        </div>
      </div>

      {/* Terminal hint */}
      <div className="terminal-hint hidden md:block">
        Click to focus • Use ↑↓ to navigate history • Tab to autocomplete • Type
        'help' for commands
      </div>
    </div>
  );
}
