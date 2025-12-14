import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCard } from "../EventCard";
import { Event } from "@/types/event";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      eventFull: "Event Full",
      availableSpots: "spots available",
      organizer: "Organizer",
    };
    return translations[key] || key;
  },
  useLocale: () => "en",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("EventCard", () => {
  const mockEvent: Event = {
    id: "1",
    title: "Tech Conference 2024",
    description: "A great tech conference",
    date: new Date("2024-12-31T10:00:00Z"),
    location: "Kyiv, Ukraine",
    capacity: 100,
    registeredCount: 50,
    organizerId: "org-1",
    organizer: {
      id: "org-1",
      name: "John Doe",
      email: "john@example.com",
      provider: "credentials" as const,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    imageUrl: "https://example.com/image.jpg",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  it("should render event card with all details", () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText("Tech Conference 2024")).toBeInTheDocument();
    expect(screen.getByText("Kyiv, Ukraine")).toBeInTheDocument();
    expect(screen.getByText("50 / 100")).toBeInTheDocument();
    expect(screen.getByText(/Organizer: John Doe/i)).toBeInTheDocument();
  });

  it("should display available spots badge when event is not full", () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText("50 spots available")).toBeInTheDocument();
  });

  it('should display "Event Full" badge when capacity is reached', () => {
    const fullEvent = { ...mockEvent, registeredCount: 100 };
    render(<EventCard event={fullEvent} />);

    expect(screen.getByText("Event Full")).toBeInTheDocument();
  });

  it("should display warning badge when almost full", () => {
    const almostFullEvent = { ...mockEvent, registeredCount: 95 };
    render(<EventCard event={almostFullEvent} />);

    expect(screen.getByText("5 spots available")).toBeInTheDocument();
  });

  it("should render event image when imageUrl is provided", () => {
    render(<EventCard event={mockEvent} />);

    const image = screen.getByAltText("Event image for Tech Conference 2024");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("should render placeholder when no imageUrl is provided", () => {
    const eventWithoutImage = { ...mockEvent, imageUrl: undefined };
    render(<EventCard event={eventWithoutImage} />);

    expect(screen.getByLabelText("No event image")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<EventCard event={mockEvent} />);

    const link = screen.getByRole("link", {
      name: /view details for tech conference 2024/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/en/events/1");

    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();
  });
});
