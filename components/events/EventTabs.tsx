"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, UserPlus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export type EventTab = "description" | "registration" | "participants";

interface EventTabsProps {
  activeTab: EventTab;
  onTabChange: (tab: EventTab) => void;
}

export function EventTabs({ activeTab, onTabChange }: EventTabsProps) {
  const t = useTranslations("tabs");

  const tabs: { id: EventTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "description",
      label: t("description"),
      icon: <FileText className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: "registration",
      label: t("registration"),
      icon: <UserPlus className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: "participants",
      label: t("participants"),
      icon: <Users className="w-4 h-4" aria-hidden="true" />,
    },
  ];

  return (
    <div className="border-b mb-6">
      <nav
        className="flex space-x-1"
        role="tablist"
        aria-label="Event tabs"
      >
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={`relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Button>
        ))}
      </nav>
    </div>
  );
}

