

import React from "react";

export default function ChakraViewLogo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <div className="bg-[#161b22] border-2 border-[#30363d] rounded-lg p-6 max-w-full overflow-x-auto shadow-lg shadow-green-500/30 flex items-center gap-8">
        
        {/* चक्र with strong neon glow */}
        <h1 className="text-9xl font-mono font-bold text-[#39ff14] neon-glow">
          चक्र
        </h1>

        {/* VIEW as ASCII art */}
        <pre className="text-[#39ff14] font-mono text-sm leading-tight whitespace-pre">
{String.raw`
██╗   ██╗██╗███████╗██╗    ██╗
██║   ██║██║██╔════╝██║    ██║
██║   ██║██║█████╗  ██║ █╗ ██║
╚██╗ ██╔╝██║██╔══╝  ██║███╗██║
 ╚████╔╝ ██║███████╗╚███╔███╔╝
  ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝ 
`}
        </pre>
      </div>
    </div>
  );
}
