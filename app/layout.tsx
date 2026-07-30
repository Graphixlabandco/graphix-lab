import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'GRAPHIX LAB',
  description: 'Graphix Lab crafts end-to-end brand identity, digital product design, 3D illustrations, dynamic video, and motion graphics.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-[#0D0B18] text-white min-h-screen font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
