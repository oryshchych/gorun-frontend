"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "gorun-sidebar-collapsed";

type ShellContextValue = {
  collapsed: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleCollapsed: () => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restore persisted UI preference
        setCollapsed(true);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      collapsed: hydrated ? collapsed : false,
      mobileOpen,
      setMobileOpen,
      toggleCollapsed,
    }),
    [collapsed, hydrated, mobileOpen, toggleCollapsed]
  );

  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error("useShell must be used within ShellProvider");
  }
  return ctx;
}
