import type { Metadata } from "next";
import "./globals.scss";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Regimotion",
  description: "Daily Exercise Mobile and Web App",
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
