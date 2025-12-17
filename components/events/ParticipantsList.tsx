"use client";

import { Participant } from "@/types/registration";
import { useTranslations } from "next-intl";

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
      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-4">{t("participants")}</h2>
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-4">{t("participants")}</h2>
        <p className="text-muted-foreground">{t("noParticipants")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold mb-4">
        {t("participants")} ({participants.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {participants.map((participant, index) => (
              <tr
                key={participant.id}
                className="border-b hover:bg-accent/50 transition-colors"
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{participant.name}</td>
                <td className="p-2">{participant.surname}</td>
                <td className="p-2">{participant.city || "-"}</td>
                <td className="p-2">{participant.runningClub || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
