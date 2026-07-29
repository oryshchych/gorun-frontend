"use server";

import { Suspense } from "react";
import { PaymentReturn } from "@/components/registration/PaymentReturn";

export default async function PaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaymentReturn />
    </Suspense>
  );
}
