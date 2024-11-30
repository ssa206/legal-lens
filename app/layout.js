import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: "Legal Lens",
  description: "Understanding Legal Documents made easy",
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
