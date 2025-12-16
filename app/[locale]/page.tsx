"use client";

import { useTranslations, useLocale } from "next-intl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import Footer from "@/components/layout/Footer";
import { useEvent } from "@/hooks/useEvents";
import { useParticipants } from "@/hooks/useParticipants";
import { useCreateRegistration } from "@/hooks/useRegistrations";
import { EventDescription } from "@/components/events/EventDescription";
import { EventRegistrationForm } from "@/components/events/EventRegistrationForm";
import { ParticipantsList } from "@/components/events/ParticipantsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useState } from "react";
import { RegistrationFormData } from "@/lib/validations/registration";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

// For MVP: We'll use a fixed event ID or fetch the first event
// In production, this would come from environment or API endpoint
const SINGLE_EVENT_ID = process.env.NEXT_PUBLIC_SINGLE_EVENT_ID || "single";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [promoCodeDiscount, setPromoCodeDiscount] = useState<{
    discountType: "percentage" | "amount";
    discountValue: number;
  } | null>(null);

  // Fetch the single event
  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useEvent(SINGLE_EVENT_ID, locale);

  // Fetch participants (only when event is loaded)
  const { data: participants = [], isLoading: participantsLoading } =
    useParticipants(event?.id || "");

  // Registration mutation
  const createRegistration = useCreateRegistration();

  // Handle promo code check (this would call an API endpoint)
  const handlePromoCodeCheck = async (code: string) => {
    // TODO: Implement API call to validate promo code
    // For now, this is a placeholder
    try {
      // const response = await apiClient.post('/promo-codes/validate', { code });
      // setPromoCodeDiscount(response.data);
      toast.success("Promo code validated");
    } catch (error: any) {
      throw error;
    }
  };

  // Handle registration form submission
  const handleRegistrationSubmit = async (data: RegistrationFormData) => {
    try {
      await createRegistration.mutateAsync(data);
      // After successful registration, redirect to payment
      // TODO: Implement payment redirect (Plata by Mono)
      toast.success(t("event.registrationSuccess"));
    } catch (error: any) {
      // Error is handled by the mutation hook
      console.error("Registration error:", error);
    }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href={`/${locale}`}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/logos/logo.png"
                alt="GoRun Events Platform"
                width={60}
                height={20}
                style={{ height: "auto" }}
                priority
              />
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href={`/${locale}`}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/logos/logo.png"
                alt="GoRun Events Platform"
                width={60}
                height={20}
                style={{ height: "auto" }}
                priority
              />
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {t("errors.eventNotFound")}
            </h1>
            <p className="text-muted-foreground">
              {t("errors.notFoundDescription")}
            </p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/logos/logo.png"
              alt="GoRun Events Platform"
              width={60}
              height={20}
              style={{ height: "auto" }}
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="description">
                {t("event.description")}
              </TabsTrigger>
              <TabsTrigger value="registration">
                {t("event.register")}
              </TabsTrigger>
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
                <ParticipantsList
                  participants={participants}
                  isLoading={participantsLoading}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
