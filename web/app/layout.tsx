import type { Metadata } from "next";
import "./globals.scss";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import HolyLoader from "holy-loader";
import { colors } from "@/constants/colors";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Regimotion",
  description: "Daily Exercise Mobile and Web App",
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" className={inter.className}>
      <HolyLoader color={colors.primary} height="4px" speed={250} />
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
