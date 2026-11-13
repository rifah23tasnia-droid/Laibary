import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans, JetBrains_Mono, Noto_Serif_Bengali } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

const notoBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '600', '700'],
  variable: '--font-bengali',
});

export const metadata: Metadata = {
  title: 'Granthagar 3D — College Library & Bangla Archive',
  description:
    'Interactive 3D college library management system with Bangla literature archive, admin librarian management, student registration approvals, and book circulation.',
  openGraph: {
    title: 'Granthagar 3D — College Library & Bangla Archive',
    description:
      'Interactive 3D college library management system with Bangla literature archive, admin librarian management, student registration approvals, and book circulation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Granthagar 3D — College Library & Bangla Archive',
    description:
      'Interactive 3D college library management system with Bangla literature archive, admin librarian management, student registration approvals, and book circulation.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} ${jetbrains.variable} ${notoBengali.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#0c0a08] text-[#f5efe6] font-sans antialiased selection:bg-amber-600/30 selection:text-amber-100 overflow-hidden"
      >
        {children}
      </body>
    </html>
  );
}
