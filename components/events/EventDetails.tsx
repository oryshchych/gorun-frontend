"use client";

import { Event } from "@/types/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  User,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { uk } from "date-fns/locale/uk";
import { useLocale } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import { getLocalizedString } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateRegistration,
  useCancelRegistration,
  useCheckRegistration,
  useEventRegistrations,
} from "@/hooks/useRegistrations";
import { useDeleteEvent } from "@/hooks/useEvents";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AnimatedDialog as Dialog,
  AnimatedDialogContent as DialogContent,
  AnimatedDialogDescription as DialogDescription,
  AnimatedDialogFooter as DialogFooter,
  AnimatedDialogHeader as DialogHeader,
  AnimatedDialogTitle as DialogTitle,
} from "@/components/ui/animated-dialog";

interface EventDetailsProps {
  event: Event;
}

export function EventDetails({ event }: EventDetailsProps) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const dateLocale = locale === "uk" ? uk : enUS;
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Check if user is registered
  const { data: isRegistered, isLoading: checkingRegistration } =
    useCheckRegistration(event.id);

  // Get event registrations (only for organizers)
  const { data: registrationsData, isLoading: loadingRegistrations } =
    useEventRegistrations(event.id, { page: 1, limit: 100 });

  // Mutations
  const createRegistration = useCreateRegistration();
  const cancelRegistration = useCancelRegistration();
  const deleteEvent = useDeleteEvent();

  const availableSpots = event.capacity - event.registeredCount;
  const isFull = availableSpots <= 0;
  const isOrganizer = user?.id === event.organizerId;

  const localizedTitle = getLocalizedString(
    event.translations?.title,
    locale,
    "en",
    event.title || ""
  );
  const localizedDescription = getLocalizedString(
    event.translations?.description,
    locale,
    "en",
    event.description || ""
  );
  const localizedLocation = getLocalizedString(
    event.translations?.location,
    locale,
    "en",
    event.location || ""
  );

  const formattedDate = format(new Date(event.date), "PPPp", {
    locale: dateLocale,
  });

  const getNameParts = (fullName?: string) => {
    if (!fullName) return { first: "Guest", last: "User" };
    const [first, ...rest] = fullName.trim().split(/\s+/);
    return {
      first: first || "Guest",
      last: rest.join(" ") || "User",
    };
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    const { first, last } = getNameParts(user?.name);
    const email = user?.email || "guest@example.com";

    try {
      await createRegistration.mutateAsync({
        eventId: event.id,
        name: first,
        surname: last,
        email,
        city: "Kyiv",
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCancelRegistration = async () => {
    if (!isRegistered || !registrationsData?.data) return;

    // Find the user's registration
    const userRegistration = registrationsData.data.find(
      (reg) => reg.userId === user?.id
    );

    if (userRegistration) {
      try {
        await cancelRegistration.mutateAsync({
          id: userRegistration.id,
          eventId: event.id,
        });
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleEdit = () => {
    router.push(`/${locale}/events/${event.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(event.id);
      setShowDeleteDialog(false);
      router.push(`/${locale}/events`);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Event Image */}
      {event.imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full h-[400px] rounded-lg overflow-hidden"
        >
          <Image
            src={event.imageUrl}
            alt={localizedTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{localizedTitle}</CardTitle>
              <div className="flex items-center gap-2">
                {isFull ? (
                  <Badge variant="destructive">{t("eventFull")}</Badge>
                ) : (
                  <Badge variant="default">
                    {availableSpots} {t("availableSpots")}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons for Organizer */}
            {isOrganizer && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  aria-label="Edit this event"
                >
                  <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                  {tCommon("edit")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  aria-label="Delete this event"
                >
                  <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  {tCommon("delete")}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar
                className="w-5 h-5 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{t("date")}</p>
                <p
                  className="font-medium wrap-break-word"
                  suppressHydrationWarning
                >
                  {formattedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin
                className="w-5 h-5 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{t("location")}</p>
                <p className="font-medium wrap-break-word">
                  {localizedLocation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users
                className="w-5 h-5 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{t("capacity")}</p>
                <p
                  className="font-medium"
                  aria-label={`${event.registeredCount} registered out of ${event.capacity} capacity`}
                >
                  {event.registeredCount} / {event.capacity}
                </p>
              </div>
            </div>

            {event.organizer?.name && (
              <div className="flex items-center gap-3">
                <User
                  className="w-5 h-5 text-muted-foreground shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {t("organizer")}
                  </p>
                  <p className="font-medium wrap-break-word">
                    {event.organizer.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{t("description")}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {localizedDescription}
            </p>
          </div>

          {/* Registration Button for Attendees */}
          {!isOrganizer && isAuthenticated && (
            <div className="pt-4">
              {checkingRegistration ? (
                <Button
                  disabled
                  className="w-full md:w-auto"
                  aria-label="Checking registration status"
                >
                  <Loader2
                    className="w-4 h-4 mr-2 animate-spin"
                    aria-hidden="true"
                  />
                  {tCommon("loading")}
                </Button>
              ) : isRegistered ? (
                <Button
                  variant="outline"
                  onClick={handleCancelRegistration}
                  disabled={cancelRegistration.isPending}
                  className="w-full md:w-auto"
                  aria-label="Cancel your registration for this event"
                >
                  {cancelRegistration.isPending && (
                    <Loader2
                      className="w-4 h-4 mr-2 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {t("cancelRegistration")}
                </Button>
              ) : (
                <Button
                  onClick={handleRegister}
                  disabled={isFull || createRegistration.isPending}
                  className="w-full md:w-auto"
                  aria-label={
                    isFull ? "Event is full" : "Register for this event"
                  }
                  aria-disabled={isFull}
                >
                  {createRegistration.isPending && (
                    <Loader2
                      className="w-4 h-4 mr-2 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {isFull ? t("eventFull") : t("register")}
                </Button>
              )}
            </div>
          )}

          {!isAuthenticated && !isOrganizer && (
            <div className="pt-4">
              <Button
                onClick={handleRegister}
                className="w-full md:w-auto"
                aria-label="Login to register for this event"
              >
                {t("register")}
              </Button>
            </div>
          )}

          {/* Registered Attendees (for organizers) */}
          {isOrganizer &&
            registrationsData &&
            registrationsData.data.length > 0 && (
              <div className="pt-4 border-t">
                <h3
                  className="font-semibold text-lg mb-4"
                  id="attendees-heading"
                >
                  {t("registeredCount")}: {registrationsData.data.length}
                </h3>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  role="list"
                  aria-labelledby="attendees-heading"
                >
                  {registrationsData.data.map((registration) => (
                    <Card key={registration.id} className="p-3" role="listitem">
                      <div className="flex items-center gap-2">
                        <User
                          className="w-4 h-4 text-muted-foreground shrink-0"
                          aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {registration.user?.name || tCommon("loading")}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {registration.user?.email || "—"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteEvent")}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteEvent.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
            >
              {deleteEvent.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
