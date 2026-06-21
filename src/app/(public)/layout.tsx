import React from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import SeasonalEffect from '@/components/public/SeasonalEffect';
import AiAssistantWidget from '@/components/public/AiAssistant/AiAssistantWidget';
import BackToTop from '@/components/public/BackToTop';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="publicPageWrapper">
      <div className="publicPageOverlay"></div>
      <div className="publicPageContent">
        <SeasonalEffect />
        <Header />
        <main>{children}</main>
        <Footer />
        <AiAssistantWidget />
        <BackToTop />
      </div>
    </div>
  );
}
