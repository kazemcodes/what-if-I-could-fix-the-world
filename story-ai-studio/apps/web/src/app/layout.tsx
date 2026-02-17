import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Story AI Studio',
  description: 'Create and play interactive story worlds powered by AI',
  keywords: ['RPG', 'AI', 'storytelling', 'fantasy', 'D&D', 'roleplaying'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-fantasy-bg-primary text-fantasy-text-light scrollbar-fantasy">
        {children}
      </body>
    </html>
  );
}
