import { describe, it, expect, vi } from "vitest";
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { EventCard } from "../EventCard";
import { Event } from "@/types/event";

type TranslationValues = Record<string, string | number>;

/**
 * Minimal ICU-ish stand-in: looks the key up per namespace and substitutes
 * `{placeholder}` tokens, so tests can assert on the rendered copy.
 */
const CATALOG: Record<string, string> = {
  "hub.viewDetailsFor": "View details for {title}",
  "hub.percentFull": "{percent}% full",
  "hub.viewEvent": "View event →",
  "hub.kidsLabel": "Kids",
  "progressBar.runners": "{taken} / {total}",
  "progressBar.spotsLeft": "{count} spots left",
  "progressBar.waitlist": "Waitlist",
};

vi.mock("next-intl", () => ({
  useTranslations:
    (namespace: string) => (key: string, values?: TranslationValues) => {
      const template = CATALOG[`${namespace}.${key}`] ?? key;
      return template.replace(/\{(\w+)\}/g, (_match, name: string) =>
        String(values?.[name] ?? "")
      );
    },
  useLocale: () => "en",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: ComponentProps<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
}));

const baseEvent: Event = {
  id: "1",
  title: "Tech Conference 2024",
  date: new Date("2024-12-31T10:00:00Z"),
  city: "Kyiv",
  capacity: 100,
  registeredCount: 50,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const withCover: Event = {
  ...baseEvent,
  cover: "https://example.com/cover.jpg",
  shortDesc: "A great tech conference",
  dateLabel: "Tue, Dec 31 2024",
  timeLabel: "10:00",
  fee: "from 400 UAH",
};

describe("EventCard", () => {
  it("renders the title, city and chips for an event with a cover", () => {
    render(<EventCard event={withCover} />);

    expect(screen.getByText("Tech Conference 2024")).toBeInTheDocument();
    expect(screen.getByText("Kyiv")).toBeInTheDocument();
    expect(screen.getByText("Tue, Dec 31 2024")).toBeInTheDocument();
    expect(screen.getByText("from 400 UAH")).toBeInTheDocument();
    expect(screen.getByText("A great tech conference")).toBeInTheDocument();
  });

  it("renders the title exactly once when a cover image is present", () => {
    render(<EventCard event={withCover} />);

    // The overlay carries the title; the body <h3> must not duplicate it.
    expect(screen.getAllByText("Tech Conference 2024")).toHaveLength(1);
    expect(
      screen.queryByRole("heading", { name: "Tech Conference 2024" })
    ).not.toBeInTheDocument();
  });

  it("falls back to a heading when there is no cover image", () => {
    render(<EventCard event={baseEvent} />);

    expect(
      screen.getByRole("heading", { name: "Tech Conference 2024" })
    ).toBeInTheDocument();
  });

  it("applies the cover image with a scrim behind it", () => {
    const { container } = render(<EventCard event={withCover} />);

    const cover = container.querySelector<HTMLElement>('[style*="url("]');
    expect(cover).not.toBeNull();
    expect(cover?.getAttribute("style")).toContain(
      "https://example.com/cover.jpg"
    );
    expect(cover?.getAttribute("style")).toContain("linear-gradient");
  });

  it("omits the fee chip when the event has no fee", () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.queryByText("from 400 UAH")).not.toBeInTheDocument();
  });

  it("renders distance pills and the kids pill", () => {
    render(
      <EventCard
        event={{
          ...baseEvent,
          distances: [
            { id: "d1", label: "10K", name: "Ten K", km: 10 },
            { id: "d2", label: "21K", name: "Half", km: 21 },
          ],
          kidsDistances: [
            { id: "k1", label: "100m", name: "Tiny Sprint", age: "3–5" },
          ],
        }}
      />
    );

    expect(screen.getByText("10K")).toBeInTheDocument();
    expect(screen.getByText("21K")).toBeInTheDocument();
    expect(screen.getByText("Kids")).toBeInTheDocument();
  });

  it("renders the fill percentage", () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByText("50% full")).toBeInTheDocument();
  });

  it("reports 0% rather than NaN when capacity is zero", () => {
    render(
      <EventCard event={{ ...baseEvent, capacity: 0, registeredCount: 0 }} />
    );

    expect(screen.getByText("0% full")).toBeInTheDocument();
  });

  it("exposes a localized link to the event detail page", () => {
    render(<EventCard event={baseEvent} />);

    const link = screen.getByRole("link", {
      name: "View details for Tech Conference 2024",
    });
    expect(link).toHaveAttribute("href", "/en/events/1");
  });

  it("renders the card as an article", () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByRole("article")).toBeInTheDocument();
  });
});
