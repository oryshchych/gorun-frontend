'use client';

import { Event } from '@/types/event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, User, Edit, Trash2, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { uk } from 'date-fns/locale/uk';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useCreateRegistration, useCancelRegistration, useCheckRegistration, useEventRegistrations } from '@/hooks/useRegistrations';
import { useDeleteEvent } from '@/hooks/useEvents';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EventDetailsProps {
  event: Event;
}

export function EventDetails({ event }: EventDetailsProps) {
  const t = useTranslations('events');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const dateLocale = locale === 'uk' ? uk : enUS;
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Check if user is registered
  const { data: isRegistered, isLoading: checkingRegistration } = useCheckRegistration(event.id);

  // Get event registrations (only for organizers)
  const { data: registrationsData, isLoading: loadingRegistrations } = useEventRegistrations(
    event.id,
    { page: 1, limit: 100 }
  );

  // Mutations
  const createRegistration = useCreateRegistration();
  const cancelRegistration = useCancelRegistration();
  const deleteEvent = useDeleteEvent();

  const availableSpots = event.capacity - event.registeredCount;
  const isFull = availableSpots <= 0;
  const isOrganizer = user?.id === event.organizerId;

  const formattedDate = format(new Date(event.date), 'PPPp', { locale: dateLocale });

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      await createRegistration.mutateAsync({ eventId: event.id });
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
    <div className="space-y-6">
      {/* Event Image */}
      {event.imageUrl && (
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
              <div className="flex items-center gap-2">
                {isFull ? (
                  <Badge variant="destructive">{t('eventFull')}</Badge>
                ) : (
                  <Badge variant="default">
                    {availableSpots} {t('availableSpots')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons for Organizer */}
            {isOrganizer && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  {tCommon('edit')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {tCommon('delete')}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('date')}</p>
                <p className="font-medium">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('location')}</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('capacity')}</p>
                <p className="font-medium">
                  {event.registeredCount} / {event.capacity}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('organizer')}</p>
                <p className="font-medium">{event.organizer.name}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{t('description')}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Registration Button for Attendees */}
          {!isOrganizer && isAuthenticated && (
            <div className="pt-4">
              {checkingRegistration ? (
                <Button disabled className="w-full md:w-auto">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tCommon('loading')}
                </Button>
              ) : isRegistered ? (
                <Button
                  variant="outline"
                  onClick={handleCancelRegistration}
                  disabled={cancelRegistration.isPending}
                  className="w-full md:w-auto"
                >
                  {cancelRegistration.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {t('cancelRegistration')}
                </Button>
              ) : (
                <Button
                  onClick={handleRegister}
                  disabled={isFull || createRegistration.isPending}
                  className="w-full md:w-auto"
                >
                  {createRegistration.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isFull ? t('eventFull') : t('register')}
                </Button>
              )}
            </div>
          )}

          {!isAuthenticated && !isOrganizer && (
            <div className="pt-4">
              <Button onClick={handleRegister} className="w-full md:w-auto">
                {t('register')}
              </Button>
            </div>
          )}

          {/* Registered Attendees (for organizers) */}
          {isOrganizer && registrationsData && registrationsData.data.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-lg mb-4">
                {t('registeredCount')}: {registrationsData.data.length}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {registrationsData.data.map((registration) => (
                  <Card key={registration.id} className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {registration.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {registration.user.email}
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
            <DialogTitle>{t('deleteEvent')}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteEvent.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
            >
              {deleteEvent.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
