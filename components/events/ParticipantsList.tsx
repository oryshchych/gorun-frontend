"use client";

import { Participant } from "@/types/registration";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";

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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {t("capacity")} ({participants.length})
      </h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* <thead>
              <tr className="bg-table-header border-b border-table-row-divider">
                <th className="p-3 text-left text-sm font-semibold text-text-secondary">
                  #
                </th>
                <th className="p-3 text-left text-sm font-semibold text-text-secondary">
                  {t("name") || "Name"}
                </th>
                <th className="p-3 text-left text-sm font-semibold text-text-secondary">
                  {t("surname") || "Surname"}
                </th>
                <th className="p-3 text-left text-sm font-semibold text-text-secondary">
                  {t("city") || "City"}
                </th>
                <th className="p-3 text-left text-sm font-semibold text-text-secondary">
                  {t("runningClub") || "Running Club"}
                </th>
              </tr>
            </thead> */}
            <tbody>
              {[...participants]
                .sort(
                  (a, b) =>
                    new Date(a.registeredAt).getTime() -
                    new Date(b.registeredAt).getTime()
                )
                .map((participant, index) => (
                  <tr
                    key={participant.id}
                    className="border-b border-table-row-divider hover:bg-table-row-hover transition-colors even:bg-table-zebra"
                  >
                    <td className="p-3 text-text-primary w-12 text-center">
                      {index + 1}
                    </td>
                    <td className="p-3 text-text-primary">
                      {participant.name}
                    </td>
                    <td className="p-3 text-text-primary">
                      {participant.surname}
                    </td>
                    <td className="p-3 text-text-secondary">
                      {participant.city || "-"}
                    </td>
                    <td className="p-3 text-text-secondary">
                      {participant.runningClub || ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
