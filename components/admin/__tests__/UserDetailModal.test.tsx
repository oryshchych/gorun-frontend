import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserDetailModal } from "../UserDetailModal";
import type { AdminUserDetail } from "@/types/user";

const user: AdminUserDetail = {
  id: "u1",
  name: "Olha Koval",
  firstName: "Olha",
  lastName: "Koval",
  email: "olha@example.com",
  phone: "+380501112233",
  image: null,
  provider: "credentials",
  dateOfBirth: null,
  gender: null,
  emergencyContactName: null,
  emergencyContactPhone: null,
  runningClub: "GoRun",
  city: "Lviv",
  deliveryAddress: null,
  isAdmin: false,
  adminRole: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  registrations: [
    {
      id: "r1",
      eventId: "e1",
      eventName: "Spring Run",
      status: "confirmed",
      paymentStatus: "completed",
      distanceLabel: "10K",
      finalPrice: 500,
      registeredAt: "2026-02-01T00:00:00.000Z",
    },
  ],
  payments: [
    {
      id: "p1",
      registrationId: "r1",
      amount: 500,
      currency: "UAH",
      status: "completed",
      createdAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    },
  ],
};

const updateMutate = vi.fn();
const deleteMutate = vi.fn();
const cancelMutate = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/error-handler", () => ({
  showSuccessToast: vi.fn(),
  handleApiError: vi.fn(),
}));

vi.mock("@/hooks/useAdminUsers", () => ({
  useAdminUserDetail: () => ({ data: user, isLoading: false }),
  useUpdateAdminUser: () => ({ mutate: updateMutate, isPending: false }),
  useSoftDeleteAdminUser: () => ({ mutate: deleteMutate, isPending: false }),
  useCancelUserRegistration: () => ({ mutate: cancelMutate, isPending: false }),
}));

describe("UserDetailModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the profile, registrations and payments", async () => {
    const u = userEvent.setup();
    render(<UserDetailModal userId="u1" onClose={vi.fn()} />);

    // Title + profile tab (active by default)
    expect(await screen.findByText("Olha Koval")).toBeInTheDocument();
    expect(screen.getByText("GoRun")).toBeInTheDocument();

    // Registrations tab
    await u.click(screen.getByRole("tab", { name: /tabRegistrations/ }));
    expect(await screen.findByText("Spring Run")).toBeInTheDocument();

    // Payments tab
    await u.click(screen.getByRole("tab", { name: /tabPayments/ }));
    expect(await screen.findByText(/500 UAH/)).toBeInTheDocument();
  });

  it("requires confirmation before deactivating a user", async () => {
    const u = userEvent.setup();
    render(<UserDetailModal userId="u1" onClose={vi.fn()} />);

    await u.click(
      await screen.findByRole("button", { name: "deactivateUser" })
    );
    // The confirm action button is shown only after opening the confirm dialog.
    const confirmBtn = await screen.findByRole("button", {
      name: "confirmDeactivate",
    });
    expect(deleteMutate).not.toHaveBeenCalled();
    await u.click(confirmBtn);
    await waitFor(() =>
      expect(deleteMutate).toHaveBeenCalledWith("u1", expect.anything())
    );
  });

  it("requires confirmation before cancelling a registration", async () => {
    const u = userEvent.setup();
    render(<UserDetailModal userId="u1" onClose={vi.fn()} />);

    await u.click(await screen.findByRole("tab", { name: /tabRegistrations/ }));
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
});
