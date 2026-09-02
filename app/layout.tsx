import "./globals.css";

export const metadata = {
  title: "Binamaris",
  description: "Autonomous treasury agent for a single vessel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
