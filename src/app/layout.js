// app/layout.js
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../public/assets/css/dashlite.css';
import TopLoadingBar from './componenet/loading';

import { Inter } from 'next/font/google';
import Script from 'next/script';
import GlobalLoader from "./componenet/globalLoader";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Inheritance Data Management',
  description: 'Dashboard and management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`bg-lighter npc-general has-sidebar ${inter.className}`}>
        {children}
        <GlobalLoader />

        {/* Scripts are okay here */}
        <Script src="/Content/assets/js/bundle.js?ver=1.4.0" strategy="afterInteractive" />
        <Script src="/Content/assets/js/scripts.js?ver=1.4.0" strategy="afterInteractive" />
      </body>
    </html>
  );
}
