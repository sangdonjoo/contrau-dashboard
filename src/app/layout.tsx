import type { Metadata } from "next";
import GlobalNav from "@/components/GlobalNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contrau Dashboard",
  description: "Contrau Eco — Company, Production & Operations Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f9fafb] antialiased">
        <GlobalNav />
        {children}
      </body>
    </html>
  );
}
