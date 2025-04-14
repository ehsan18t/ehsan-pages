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
  return (
    <div className="mx-auto max-w-[650px] rounded-lg overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg my-8 terminal-container">
      {/* <!-- Terminal Header --> */}
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

      {/* <!-- Terminal Content with Scrollbar --> */}
      <div className="p-2 md:p-4 font-mono text-xs leading-relaxed text-gray-300 terminal-content overflow-y-auto">
        <div className="mb-1.5 flex gap-1 items-center">
          <Directory user="hacker" host="linux" path="portfolio" />
          <span className="ml-1 command-input">compile index.html</span>
        </div>
        <div className="pl-0 mb-1 terminal-output">
          <div className="text-red-400">
            Error: Cannot compile index.html. HTML is not a programming
            language.
          </div>
          <div className="mb-1.5 text-yellow-300">
            Did you mean to use a build tool like Webpack or Vite instead?
          </div>
        </div>

        <div className="flex gap-1 items-center">
          <Directory user="hacker" host="linux" path="portfolio" />
          <span className="ml-1 terminal-cursor"></span>
        </div>
      </div>
    </div>
  );
}
