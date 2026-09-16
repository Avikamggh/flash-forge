import type { Metadata } from 'next';
import './globals.css';
import { SimulationProvider } from '@/context/SimulationContext';

export const metadata: Metadata = {
  title: 'FlashForge — Cloud Infrastructure Under Pressure',
  description: 'Interactive cloud scalability simulator and real-time control center. Engineered to survive the spike.',
  keywords: ['cloud infrastructure', 'auto-scaling', 'load balancing', 'flash sale', 'simulator'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SimulationProvider>
          {children}
        </SimulationProvider>
      </body>
    </html>
  );
}
