"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { EventDescription } from "@/components/events/EventDescription";
import { EventRegistrationForm } from "@/components/events/EventRegistrationForm";
import { ParticipantsList } from "@/components/events/ParticipantsList";
import { useState, useEffect } from "react";
import { RegistrationFormData } from "@/lib/validations/registration";
import { useCreateRegistration } from "@/hooks/useRegistrations";
import { toast } from "sonner";
import { Event } from "@/types/event";
import { Participant } from "@/types/registration";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { validatePromoCode } from "@/lib/api/promo-codes";
import { PromoCodeValidationResponse } from "@/types/promo-code";

interface HomePageClientProps {
  event: Event;
  participants: Participant[];
  locale: string;
}

export default function HomePageClient({
  event,
  participants,
  locale,
}: HomePageClientProps) {
  const t = useTranslations();
  const createRegistration = useCreateRegistration();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("description");
  const [promoCodeDiscount, setPromoCodeDiscount] =
    useState<PromoCodeValidationResponse | null>(null);

  // Sync tab with URL search params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["description", "registration", "participants"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("description");
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "description") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const newUrl = params.toString()
      ? `/${locale}?${params.toString()}`
      : `/${locale}`;
    router.push(newUrl, { scroll: false });
  };

  const handlePromoCodeCheck = async (code: string) => {
    const normalizedCode = code.trim();

    // If the field was cleared, drop any existing discount and skip network calls
    if (!normalizedCode) {
      setPromoCodeDiscount(null);
      return;
    }

    try {
      const result = await validatePromoCode({
        code: normalizedCode,
        eventId: event.id,
      });

      // validatePromoCode returns null if invalid/expired
      if (!result) {
        setPromoCodeDiscount(null);
        throw new Error(t("event.promoCodeInvalid"));
      }

      setPromoCodeDiscount(result);
      toast.success(t("event.promoCodeApplied"));
    } catch (error: any) {
      setPromoCodeDiscount(null);
      throw error;
    }
  };

  const handleRegistrationSubmit = async (data: RegistrationFormData) => {
    try {
      await createRegistration.mutateAsync(data);
      // Don't show toast here - it's handled in useCreateRegistration hook
      // The hook will redirect to payment if paymentLink exists
    } catch (error: any) {
      console.error("Registration error:", error);
      // Error is already handled by the mutation
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <Card className="mb-8 p-3 sm:p-4">
        <TabsList className="flex w-full bg-transparent p-0 gap-2 sm:gap-1 sm:grid sm:grid-cols-3">
          <TabsTrigger
            value="description"
            className="flex-1 sm:flex-none min-h-[44px] px-3 py-2.5 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap bg-transparent text-text-secondary data-[state=active]:bg-[#48C773] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all rounded-md"
          >
            {t("event.description")}
          </TabsTrigger>
          <TabsTrigger
            value="registration"
            className="flex-1 sm:flex-none min-h-[44px] px-3 py-2.5 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap bg-transparent text-text-secondary data-[state=active]:bg-[#48C773] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all rounded-md"
          >
            {t("event.register")}
          </TabsTrigger>
          <TabsTrigger
            value="participants"
            className="flex-1 sm:flex-none min-h-[44px] px-3 py-2.5 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap bg-transparent text-text-secondary data-[state=active]:bg-[#48C773] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all rounded-md"
          >
            {t("event.participants")}
          </TabsTrigger>
        </TabsList>
      </Card>

      <TabsContent value="description" className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              <EventDescription event={event} />
            </motion.div>
          )}
        </AnimatePresence>
      </TabsContent>

      <TabsContent value="registration" className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "registration" && (
            <motion.div
              key="registration"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              <div className="max-w-2xl mx-auto">
                <EventRegistrationForm
                  event={event}
                  onSubmit={handleRegistrationSubmit}
                  isLoading={createRegistration.isPending}
                  promoCodeDiscount={promoCodeDiscount}
                  onPromoCodeCheck={handlePromoCodeCheck}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </TabsContent>

      <TabsContent value="participants" className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "participants" && (
            <motion.div
              key="participants"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              <div className="max-w-4xl mx-auto">
                <ParticipantsList
                  participants={participants}
                  isLoading={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </TabsContent>
    </Tabs>
  );
}
