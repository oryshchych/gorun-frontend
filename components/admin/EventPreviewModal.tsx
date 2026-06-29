"use client";

import Image from "next/image";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { uk } from "date-fns/locale/uk";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getLocalizedString } from "@/lib/utils";
import type { Event } from "@/types/event";

interface EventPreviewModalProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5 border-b border-line last:border-0">
      <span className="text-sm font-medium text-ink-3">{label}</span>
      <span className="text-sm text-ink break-words">{value}</span>
    </div>
  );
}

export function EventPreviewModal({
  event,
  open,
  onClose,
  onEdit,
  onDelete,
}: EventPreviewModalProps) {
  const locale = useLocale();
  const t = useTranslations("admin.events");
  const tForm = useTranslations("admin.eventForm");
  const tCommon = useTranslations("common");
  const dateLocale = locale === "uk" ? uk : enUS;
  if (!event) return null;

  const titleEn =
    event.translations?.title?.en?.trim() || event.title || event.id;
  const titleUk =
    event.translations?.title?.uk?.trim() || event.title || event.id;
  const descEn = event.translations?.description?.en?.trim() || "";
  const descUk = event.translations?.description?.uk?.trim() || "";
  const locationEn = event.translations?.location?.en?.trim() || event.location || "";
  const locationUk = event.translations?.location?.uk?.trim() || event.location || "";

  const title = getLocalizedString(event.translations?.title, locale, "en", event.title ?? "");
  const dateStr = format(new Date(event.date), "PP p", { locale: dateLocale });

  const coverUrl =
    event.cover ||
    event.imageUrl?.landscape ||
    event.imageUrl?.portrait ||
    null;

  const active = event.isActive !== false;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("previewTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {coverUrl && (
            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-surface-2">
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}

          <div className="divide-y divide-line">
            <PreviewRow label="EN title" value={titleEn} />
            <PreviewRow label="UK title" value={titleUk} />
            <PreviewRow label={t("colDate")} value={dateStr} />
            <PreviewRow
              label={tForm("statusLabel")}
              value={
                event.status ? (
                  <Badge variant="secondary" className="font-normal">
                    {tForm(`status.${event.status}`)}
                  </Badge>
                ) : (
                  "—"
                )
              }
            />
            <PreviewRow
              label={tForm("isActiveLabel")}
              value={
                active ? (
                  <Badge variant="default" className="font-normal">
                    {tForm("isActiveLabel")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-normal">
                    {t("inactiveLabel")}
                  </Badge>
                )
              }
            />
            {locationEn && (
              <PreviewRow label="EN location" value={locationEn} />
            )}
            {locationUk && (
              <PreviewRow label="UK location" value={locationUk} />
            )}
            {event.registrationStart && (
              <PreviewRow
                label={tForm("registrationStart")}
                value={format(new Date(event.registrationStart), "PP p", {
                  locale: dateLocale,
                })}
              />
            )}
            {event.registrationEnd && (
              <PreviewRow
                label={tForm("registrationEnd")}
                value={format(new Date(event.registrationEnd), "PP p", {
                  locale: dateLocale,
                })}
              />
            )}
            {event.distances && event.distances.length > 0 && (
              <PreviewRow
                label={tForm("sectionDistances")}
                value={event.distances.map((d) => d.label).join(", ")}
              />
            )}
            {descEn && <PreviewRow label="EN description" value={descEn} />}
            {descUk && <PreviewRow label="UK description" value={descUk} />}
            {event.regulationUrl && (
              <PreviewRow
                label={tForm("regulation")}
                value={
                  <a
                    href={event.regulationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand underline underline-offset-2 hover:text-brand-hover"
                  >
                    {tForm("regulation")}
                  </a>
                }
              />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {onDelete && (
            <Button
              variant="destructive"
              onClick={() => onDelete(event.id)}
              className="mr-auto"
            >
              <Trash2 className="mr-2 size-4" aria-hidden />
              {t("delete")}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            {tCommon("close")}
          </Button>
          <Button variant="brand" onClick={() => onEdit(event.id)}>
            <Pencil className="mr-2 size-4" aria-hidden />
            {t("previewEdit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
