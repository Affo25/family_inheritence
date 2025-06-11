'use client';

import "bootstrap/dist/css/bootstrap.min.css";
import dynamic from "next/dynamic";
import Sidebar from "../componenet/Theme_component/Sidebr";
import { ToastProvider } from '../../app/providers/ToastProvider';
import Script from "next/script";
import Header from "../componenet/Theme_component/Headers";
import { Inter } from "next/font/google";
import { usePathname, useRouter } from 'next/navigation';
import Footers from "../componenet/Theme_component/Footers";
import GlobalLoader from "../componenet/globalLoader";
import { useEffect, useState } from "react";

const BootstrapBundle = dynamic(() => import("bootstrap/dist/js/bootstrap.bundle.min.js"), { ssr: false });
const Jquery = dynamic(() => import("jquery/dist/jquery.min.js"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Listen to route changes to show/hide loader
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleEnd = () => setLoading(false);

    router.events?.on('routeChangeStart', handleStart);
    router.events?.on('routeChangeComplete', handleEnd);
    router.events?.on('routeChangeError', handleEnd);

    return () => {
      router.events?.off('routeChangeStart', handleStart);
      router.events?.off('routeChangeComplete', handleEnd);
      router.events?.off('routeChangeError', handleEnd);
    };
  }, [router]);

  return (
    <div className={`nk-app-root ${inter.className}`}>
      <GlobalLoader visible={loading} />

      <div className="nk-main">
        <Sidebar />
        <div className="nk-wrap">
          <Header />
          <div className="nk-content">
            <div className="container-fluid">
              <div className="nk-content-inner">{children}</div>
            </div>
          </div>
          <Footers />
        </div>
      </div>

      {/* Toast Provider if needed globally */}
      <ToastProvider />

      {/* Load scripts asynchronously */}
      <Script src="/public/Content/assets/js/bundle.js?ver=1.4.0" strategy="afterInteractive" />
      <Script src="/public/Content/assets/js/scripts.js?ver=1.4.0" strategy="afterInteractive" />
    </div>
  );
}
