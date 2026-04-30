import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast"; // <-- 1. Ye import add kiya
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VizoSyn– Skill-Based Teammate Matchmaking Platform",
  description: "A high-performance, skill-based matchmaking engine for developers.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster 
          position="bottom-right" 
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#1e1e1e', 
              color: '#ffffff',    
              border: '1px solid #333',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#1e1e1e',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1e1e1e',
              },
            },
          }}
        />
      </body>
    </html>
  );
}