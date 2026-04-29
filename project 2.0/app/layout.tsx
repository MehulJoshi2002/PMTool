import type { Metadata } from "next";
import "./globals.css";
import WorkspaceLayout from "../components/layout/WorkspaceLayout";

export const metadata: Metadata = {
  title: "ProductOS — Product Management Workspace",
  description: "An all-in-one product management workspace for teams. Prioritize features with RICE scoring, build user journey diagrams, plan roadmaps, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <WorkspaceLayout>{children}</WorkspaceLayout>
      </body>
    </html>
  );
}
