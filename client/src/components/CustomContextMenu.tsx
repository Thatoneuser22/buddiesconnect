import { useState, useEffect } from "react";
import { Copy, RefreshCw } from "lucide-react";

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
}

export function useCustomContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    x: 0,
    y: 0,
    visible: false,
  });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
    };

    const handleClick = () => {
      setContextMenu(prev => ({ ...prev, visible: false }));
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return contextMenu;
}

interface CustomContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
}

export function CustomContextMenu({ x, y, visible }: CustomContextMenuProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        minWidth: "160px",
      }}
    >
      <button
        onClick={() => document.execCommand("copy")}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition"
      >
        <Copy className="w-4 h-4" />
        Copy
      </button>
      <button
        onClick={() => window.location.reload()}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh
      </button>
    </div>
  );
}
