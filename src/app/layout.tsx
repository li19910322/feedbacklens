import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FeedbackLens - AI-Powered Feedback Analysis',
  description:
    'Understand your customers better with AI-powered feedback analysis and real-time analytics.',
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
