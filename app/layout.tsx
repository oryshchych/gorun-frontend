import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GoRun",
  description: "Events registration and management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
