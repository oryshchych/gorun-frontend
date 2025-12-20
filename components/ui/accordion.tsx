"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
}

const AccordionContext = React.createContext<{
  openItems: Set<string>;
  toggleItem: (value: string) => void;
}>({
  openItems: new Set(),
  toggleItem: () => {},
});

export function Accordion({
  children,
  className,
  defaultValue,
  type = "single",
}: {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  type?: "single" | "multiple";
}) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(
    defaultValue ? new Set([defaultValue]) : new Set()
  );

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        const newSet = new Set(prev);
        if (type === "single") {
          newSet.clear();
          if (!prev.has(value)) {
            newSet.add(value);
          }
        } else {
          if (newSet.has(value)) {
            newSet.delete(value);
          } else {
            newSet.add(value);
          }
        }
        return newSet;
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  children,
  className,
}: AccordionItemProps) {
  const { openItems, toggleItem } = React.useContext(AccordionContext);
  const isOpen = openItems.has(value);

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AccordionTrigger) {
            return React.cloneElement(child, {
              isOpen,
              onClick: () => toggleItem(value),
            } as Partial<AccordionTriggerProps>);
          }
          if (child.type === AccordionContent) {
            return React.cloneElement(child, {
              isOpen,
            } as Partial<AccordionContentProps>);
          }
        }
        return child;
      })}
    </div>
  );
}

export function AccordionTrigger({
  children,
  className,
  onClick,
  isOpen = false,
}: AccordionTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between p-4 text-left font-medium transition-all hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
        className
      )}
      aria-expanded={isOpen}
    >
      <span className="flex-1">{children}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform" />
      </motion.div>
    </button>
  );
}

export function AccordionContent({
  children,
  className,
  isOpen = false,
}: AccordionContentProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className={cn("px-4 pb-4 pt-0", className)}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
