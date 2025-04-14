import { useState, useEffect, useRef, useCallback } from "react";
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

  // Command definitions
  const COMMANDS = [
    {
      name: "send",
      description: "Sends an email message to the specified address",
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
          // Simulating API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          setIsLoading(false);
          return {
            type: "success",
            content: `Message sent successfully to ${email}`,
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
  <email>    - The recipient's email address (required)
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
  }, [commandHistory]);

  // Run the default 'man send' command on initial render
  useEffect(() => {
    executeCommand("man send", false);
  }, []);

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
      if (e.key === "Enter" && currentInput.trim()) {
        executeCommand(currentInput, true);
        setCurrentInput("");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandBuffer.length > 0) {
          const newPosition = Math.min(
            bufferPosition + 1,
            commandBuffer.length - 1,
          );
          setBufferPosition(newPosition);
          setCurrentInput(commandBuffer[newPosition]);
        }
      } else if (e.key === "ArrowDown") {
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
      }
    },
    [currentInput, commandBuffer, bufferPosition],
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
        <div className="terminal-title">hacker@portfolio: ~/contact</div>
        <div className="terminal-menu">⌘</div>
      </div>

      {/* Terminal Content with Scrollbar */}
      <div ref={terminalRef} className="terminal-content" aria-live="polite">
        {/* Command history and responses */}
        {commandHistory.map((entry, index) => (
          <div key={index}>
            {entry.type === "command" && (
              <div className="mb-2 flex gap-1 items-center prompt-line">
                <Directory user="hacker" host="portfolio" path="contact" />
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

        {/* Current command line with cursor */}
        <div className="flex gap-1 items-center prompt-line">
          <Directory user="hacker" host="portfolio" path="contact" />
          <span className="ml-1">{currentInput}</span>
          {!isLoading && (
            <span
              className={
                isFocused ? "terminal-cursor-blink" : "terminal-cursor-static"
              }
              aria-hidden="true"
            ></span>
          )}
          {isLoading && (
            <span className="processing-indicator">Processing...</span>
          )}
        </div>

        {/* Hidden input field to capture keyboard events */}
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute top-0 left-0 h-1 w-1"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label="Terminal input"
        />
      </div>

      {/* Terminal hint */}
      <div className="terminal-hint">
        Click to focus • Use ↑↓ to navigate history • Tab to autocomplete • Type
        'help' for commands
      </div>
    </div>
  );
}
