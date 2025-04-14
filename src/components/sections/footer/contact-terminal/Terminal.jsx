import { useCallback, useEffect, useRef, useState } from "react";
import "./terminal.css";

function Directory({ user, host, path }) {
  return (
    <>
      <span className="flex">
        <span className="text-[#33d790]">{user}</span>
        <span className="text-gray-400">@</span>
        <span className="text-[#78b9fa]">{host}</span>
        <span className="text-gray-400">:</span>
      </span>
      <span className="flex">
        <span className="text-[#c792ea]">~/{path}</span>
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
      // Only add non-empty commands and avoid duplicates at the end
      if (
        command.trim() &&
        (commandBuffer.length === 0 || commandBuffer[0] !== command)
      ) {
        setCommandBuffer((prev) => [command, ...prev.slice(0, 19)]); // Keep last 20 commands
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
        // Navigate command history upward
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
        // Navigate command history downward
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
        // Simple command completion
        const input = currentInput.toLowerCase();
        if (!input) return;

        if ("man".startsWith(input)) {
          setCurrentInput("man ");
        } else if ("send".startsWith(input)) {
          setCurrentInput("send ");
        } else if (input === "man ") {
          setCurrentInput("man send");
        } else if ("clear".startsWith(input)) {
          setCurrentInput("clear");
        } else if ("help".startsWith(input)) {
          setCurrentInput("help");
        }
      }
    },
    [currentInput, commandBuffer, bufferPosition],
  );

  const executeCommand = useCallback(
    async (commandInput, addToBuffer = true) => {
      // Add command to buffer if it's a user command
      if (addToBuffer) {
        addToCommandBuffer(commandInput);
      }

      // Add command to history
      const newEntry = {
        type: "command",
        content: commandInput,
      };

      setCommandHistory((prev) => [...prev, newEntry]);

      // Parse the command
      const parts = commandInput.trim().split(" ");
      const cmd = parts[0].toLowerCase();

      switch (cmd) {
        case "send": {
          if (parts.length < 3) {
            setCommandHistory((prev) => [
              ...prev,
              {
                type: "error",
                content:
                  "Error: 'send' command requires both email and message arguments.\nUsage: send <email> <message>",
              },
            ]);
            return;
          }

          const email = parts[1];
          const message = parts.slice(2).join(" ").trim();

          // Message validation
          if (!message) {
            setCommandHistory((prev) => [
              ...prev,
              {
                type: "error",
                content: "Error: Message cannot be empty.",
              },
            ]);
            return;
          }

          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            setCommandHistory((prev) => [
              ...prev,
              {
                type: "error",
                content: `Error: Invalid email format '${email}'`,
              },
            ]);
            return;
          }

          // Send message via API
          setIsLoading(true);
          try {
            // Replace with actual API call
            // const response = await fetch('/api/contact', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ email, message })
            // });
            //
            // if (!response.ok) {
            //   throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            // }

            // Simulating API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setCommandHistory((prev) => [
              ...prev,
              {
                type: "success",
                content: `Message sent successfully to ${email}`,
              },
            ]);
          } catch (error) {
            setCommandHistory((prev) => [
              ...prev,
              {
                type: "error",
                content: `Error sending message: ${error.message || "Network error"}`,
              },
            ]);
          } finally {
            setIsLoading(false);
          }
          break;
        }

        case "man": {
          if (parts[1]?.toLowerCase() === "send") {
            setCommandHistory((prev) => [
              ...prev,
              {
                type: "manual",
                content: `COMMAND: send
USAGE: send <email> <message>
DESCRIPTION: 
  Sends an email message to the specified address.
  
PARAMETERS:
  <email>    - The recipient's email address (required)
  <message>  - The message content (required)
  
EXAMPLES:
  send user@example.com Hello, how are you?
  send contact@domain.com I'd like to discuss a project opportunity.`,
              },
            ]);
          } else if (parts[1]?.toLowerCase() === "clear") {
            setCommandHistory((prev) => [
              ...prev,
              {
                type: "manual",
                content: `COMMAND: clear
USAGE: clear
DESCRIPTION: 
  Clears the terminal screen.`,
              },
            ]);
          } else if (parts[1]?.toLowerCase() === "help") {
            setCommandHistory((prev) => [
              ...prev,
              {
                type: "manual",
                content: `COMMAND: help
USAGE: help
DESCRIPTION: 
  Displays available commands and basic usage information.`,
              },
            ]);
          } else {
            setCommandHistory((prev) => [
              ...prev,
              {
                type: "error",
                content: `No manual entry for '${parts[1] || ""}'
              
Supported commands: send, clear, help`,
              },
            ]);
          }
          break;
        }

        case "clear": {
          setCommandHistory([]);
          break;
        }

        case "help": {
          setCommandHistory((prev) => [
            ...prev,
            {
              type: "info",
              content: `Available commands:
  
send <email> <message> - Send a message to provided email
man <command>         - Display manual for the specified command
clear                 - Clear terminal history
help                  - Display this help message

Type 'man <command>' for more detailed information about a command.`,
            },
          ]);
          break;
        }

        default:
          setCommandHistory((prev) => [
            ...prev,
            {
              type: "error",
              content: `Command not found: ${cmd}
            
Type 'help' to see available commands.`,
            },
          ]);
      }
    },
    [addToCommandBuffer],
  );

  return (
    <div
      className="mx-auto max-w-[650px] rounded-lg overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg my-8 terminal-container"
      onClick={focusInput}
      aria-label="Interactive terminal"
      role="region"
    >
      {/* Terminal Header */}
      <div className="flex items-center px-3 py-1.5 bg-[#323233] border-b border-gray-800 justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] mr-2 select-none cursor-pointer"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] mr-2 select-none cursor-pointer"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] select-none cursor-pointer"></div>
        </div>
        <div className="text-xs text-gray-400 flex-1 text-center font-sans select-none">
          bash ~ hacker@linux
        </div>
        <div className="text-gray-500 text-xs">⌘</div>
      </div>

      {/* Terminal Content with Scrollbar */}
      <div
        ref={terminalRef}
        className="p-2 md:p-4 font-mono text-xs leading-relaxed text-gray-300 terminal-content overflow-y-auto"
        aria-live="polite"
      >
        {/* Command history and responses */}
        {commandHistory.map((entry, index) => (
          <div key={index}>
            {entry.type === "command" && (
              <div className="mb-1.5 flex gap-1 items-center">
                <Directory user="hacker" host="linux" path="portfolio" />
                <span className="ml-1 command-input">{entry.content}</span>
              </div>
            )}

            {entry.type === "error" && (
              <div className="pl-0 mb-3 terminal-output">
                <div className="text-red-400 whitespace-pre-line">
                  {entry.content}
                </div>
              </div>
            )}

            {entry.type === "success" && (
              <div className="pl-0 mb-3 terminal-output">
                <div className="text-green-400">{entry.content}</div>
              </div>
            )}

            {entry.type === "info" && (
              <div className="pl-0 mb-3 terminal-output">
                <div className="text-blue-400 whitespace-pre-line">
                  {entry.content}
                </div>
              </div>
            )}

            {entry.type === "manual" && (
              <div className="pl-0 mb-3 terminal-output">
                <div className="text-yellow-300 whitespace-pre-line">
                  {entry.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Current command line with cursor */}
        <div className="flex gap-1 items-center">
          <Directory user="hacker" host="linux" path="portfolio" />
          <span>{currentInput}</span>
          {!isLoading && (
            <span
              className={
                isFocused ? "terminal-cursor-blink" : "terminal-cursor-static"
              }
              aria-hidden="true"
            ></span>
          )}
          {isLoading && <span className="text-gray-400">Processing...</span>}
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
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-800">
        Click to focus • Use ↑↓ to navigate history • Tab to autocomplete • Type
        'help' for available commands
      </div>
    </div>
  );
}
