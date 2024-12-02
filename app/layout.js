import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: "Legal Lens",
  description: "Understanding Legal Documents made easy",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      }
    ],
    shortcut: ["/favicon.svg"],
    apple: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      }
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body className="bg-white">
        {children}
      </body>
    </html>
  );
}
