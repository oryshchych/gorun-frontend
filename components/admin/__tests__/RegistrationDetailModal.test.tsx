import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegistrationDetailModal } from "../RegistrationDetailModal";
import type { AdminRegistrationDetail } from "@/types/registration";

const reg: AdminRegistrationDetail = {
  id: "r1",
  fullName: "Olha Koval",
  name: "Olha",
  surname: "Koval",
  email: "olha@example.com",
  phone: "+380501112233",
  eventId: "e1",
  eventName: "Spring Run",
  distanceLabel: "10K",
  bib: "42",
  finalPrice: 500,
  paymentStatus: "completed",
  status: "confirmed",
  registeredAt: "2026-02-01T00:00:00.000Z",
  city: "Lviv",
  runningClub: "GoRun",
  shirtSize: "M",
  estimatedPace: "5:30",
  promoCode: null,
  afuDonation: null,
  kidsRegistrations: [],
  userId: null,
  userName: null,
  payments: [
    {
      id: "p1",
      amount: 500,
      currency: "UAH",
      status: "completed",
      createdAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    },
  ],
};

// Mutable reference so individual tests can vary the returned data.
let mockRegData: AdminRegistrationDetail = reg;

const cancelMutate = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/error-handler", () => ({
  showSuccessToast: vi.fn(),
  handleApiError: vi.fn(),
}));

vi.mock("@/hooks/useAdminRegistrations", () => ({
  useAdminRegistrationDetail: () => ({ data: mockRegData, isLoading: false }),
  useCancelAdminRegistration: () => ({
    mutate: cancelMutate,
    isPending: false,
  }),
}));

describe("RegistrationDetailModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegData = reg; // reset to default confirmed registration
  });

  it("renders participant details and payments", async () => {
    render(<RegistrationDetailModal registrationId="r1" onClose={vi.fn()} />);

    expect(await screen.findByText("Olha Koval")).toBeInTheDocument();
    // Running club shows in participant section
    expect(screen.getByText("GoRun")).toBeInTheDocument();
    // Payment row shows amount + currency
    expect(screen.getByText(/500 UAH/)).toBeInTheDocument();
  });

  it("requires confirmation before cancelling", async () => {
    const u = userEvent.setup();
    render(<RegistrationDetailModal registrationId="r1" onClose={vi.fn()} />);

    await u.click(
      await screen.findByRole("button", { name: "cancelRegistration" })
    );

    const confirmBtn = await screen.findByRole("button", {
      name: "confirmCancelRegistration",
    });
    expect(cancelMutate).not.toHaveBeenCalled();
    await u.click(confirmBtn);
    await waitFor(() =>
      expect(cancelMutate).toHaveBeenCalledWith("r1", expect.anything())
    );
  });

  it("hides the cancel button when registration is already cancelled", async () => {
    mockRegData = { ...reg, status: "cancelled" };
    render(<RegistrationDetailModal registrationId="r1" onClose={vi.fn()} />);

    await screen.findByText("Olha Koval");
    expect(
      screen.queryByRole("button", { name: "cancelRegistration" })
    ).not.toBeInTheDocument();
  });
});
