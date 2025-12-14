import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventList } from "../EventList";
import { Event } from "@/types/event";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      noEvents: "No events found",
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

describe("EventList", () => {
  const mockEvents: Event[] = [
    {
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
    },
    {
      id: "2",
      title: "Web Development Workshop",
      description: "Learn modern web development",
      date: new Date("2024-11-15T14:00:00Z"),
      location: "Lviv, Ukraine",
      capacity: 50,
      registeredCount: 25,
      organizerId: "org-2",
      organizer: {
        id: "org-2",
        name: "Jane Smith",
        email: "jane@example.com",
        provider: "credentials" as const,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];

  it("should render list of events", () => {
    render(<EventList events={mockEvents} />);

    expect(screen.getByText("Tech Conference 2024")).toBeInTheDocument();
    expect(screen.getByText("Web Development Workshop")).toBeInTheDocument();
  });

  it("should display loading skeletons when isLoading is true", () => {
    render(<EventList events={[]} isLoading={true} />);

    const loadingStatus = screen.getByRole("status", {
      name: /loading events/i,
    });
    expect(loadingStatus).toBeInTheDocument();
  });

  it('should display "no events" message when events array is empty', () => {
    render(<EventList events={[]} />);

    expect(screen.getByText("No events found")).toBeInTheDocument();
  });

  it('should display "no events" message when events is undefined', () => {
    render(<EventList events={undefined as any} />);

    expect(screen.getByText("No events found")).toBeInTheDocument();
  });

  it("should render correct number of event cards", () => {
    render(<EventList events={mockEvents} />);

    const eventCards = screen.getAllByRole("article");
    expect(eventCards).toHaveLength(2);
  });

  it("should have proper accessibility attributes", () => {
    render(<EventList events={mockEvents} />);

    const list = screen.getByRole("list", { name: /events list/i });
    expect(list).toBeInTheDocument();

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);
  });
});
