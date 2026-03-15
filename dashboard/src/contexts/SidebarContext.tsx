import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SidebarMode = 'expanded' | 'collapsed' | 'hover';

interface SidebarContextType {
  isOpen: boolean;
  mode: SidebarMode;
  isHovered: boolean;
  toggle: () => void;
  close: () => void;
  setMode: (mode: SidebarMode) => void;
  setHovered: (hovered: boolean) => void;
  isMobile: boolean;
  /** Whether the sidebar content should appear expanded (either expanded mode or hover mode + hovered) */
  isExpanded: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  mode: 'hover',
  isHovered: false,
  toggle: () => {},
  close: () => {},
  setMode: () => {},
  setHovered: () => {},
  isMobile: false,
  isExpanded: true,
});

const STORAGE_KEY = 'sidebar-mode';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setModeState] = useState<SidebarMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'expanded' || saved === 'collapsed' || saved === 'hover') return saved;
    return 'expanded';
  });
  const [isHovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function setMode(newMode: SidebarMode) {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    if (newMode !== 'hover') setHovered(false);
  }

  const isExpanded = mode === 'expanded' || (mode === 'hover' && isHovered);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        mode,
        isHovered,
        toggle: () => setIsOpen((v) => !v),
        close: () => setIsOpen(false),
        setMode,
        setHovered,
        isMobile,
        isExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
