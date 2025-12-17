"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [promoCodeDiscount, setPromoCodeDiscount] = useState<{
    discountType: "percentage" | "amount";
    discountValue: number;
  } | null>(null);

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
    try {
      // TODO: call API to validate promo codes
      // const response = await apiClient.post('/promo-codes/validate', { code });
      // setPromoCodeDiscount(response.data);
      toast.success("Promo code validated");
    } catch (error: any) {
      throw error;
    }
  };

  const handleRegistrationSubmit = async (data: RegistrationFormData) => {
    try {
      await createRegistration.mutateAsync(data);
      toast.success(t("event.registrationSuccess"));
    } catch (error: any) {
      console.error("Registration error:", error);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="description">{t("event.description")}</TabsTrigger>
        <TabsTrigger value="registration">{t("event.register")}</TabsTrigger>
        <TabsTrigger value="participants">
          {t("event.participants")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <EventDescription event={event} />
      </TabsContent>

      <TabsContent value="registration" className="mt-6">
        <div className="max-w-2xl mx-auto">
          <EventRegistrationForm
            event={event}
            onSubmit={handleRegistrationSubmit}
            isLoading={createRegistration.isPending}
            promoCodeDiscount={promoCodeDiscount}
            onPromoCodeCheck={handlePromoCodeCheck}
          />
        </div>
      </TabsContent>

      <TabsContent value="participants" className="mt-6">
        <div className="max-w-4xl mx-auto">
          <ParticipantsList participants={participants} isLoading={false} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
