import type { Metadata } from "next";
import "./globals.css";
import WorkspaceLayout from "../components/layout/WorkspaceLayout";

export const metadata: Metadata = {
  title: "Voxamo — Product Management Workspace",
  description: "An all-in-one product management workspace for teams. Prioritize features with RICE scoring, build user journey diagrams, plan roadmaps, and more.",
};

import { ThemeProvider } from "../components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <WorkspaceLayout>{children}</WorkspaceLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
