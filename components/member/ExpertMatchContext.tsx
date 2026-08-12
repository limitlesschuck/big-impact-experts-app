"use client";

import { createContext, useContext, useState } from "react";

// Lets the "Search with AI" button on /dashboard and ExpertMatchWidget's
// own floating corner button drive the same open/closed state, even
// though the button lives on a page (a server-component child) and the
// widget lives up in the dashboard layout -- without this, there'd be no
// way for a click on the landing page to reach a state variable declared
// inside a sibling component higher in the tree.
const ExpertMatchStateContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export function ExpertMatchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <ExpertMatchStateContext.Provider value={{ open, setOpen }}>
      {children}
    </ExpertMatchStateContext.Provider>
  );
}

export function useExpertMatch() {
  const ctx = useContext(ExpertMatchStateContext);
  if (!ctx) throw new Error("useExpertMatch must be used within an ExpertMatchProvider");
  return ctx;
}
