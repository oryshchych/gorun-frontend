"use client";

import { Participant } from "@/types/registration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface ParticipantsListProps {
  participants: Participant[];
  isLoading?: boolean;
}

export function ParticipantsList({
  participants,
  isLoading = false,
}: ParticipantsListProps) {
  const t = useTranslations("event");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t("participants")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("loading")}</p>
        </CardContent>
      </Card>
    );
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t("participants")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("noParticipants")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t("participants")} ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">
                    {participant.name} {participant.surname}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {participant.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{participant.city}</span>
                    </div>
                  )}
                  {participant.runningClub && (
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{participant.runningClub}</span>
                    </div>
                  )}
                  <div className="text-xs">
                    {format(new Date(participant.registeredAt), "PPP")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
