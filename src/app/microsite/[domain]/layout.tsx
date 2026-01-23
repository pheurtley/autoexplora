import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getDealerConfigByDomain } from "@/lib/microsite/get-dealer-config";
import { MicrositeHeader } from "@/components/microsite/MicrositeHeader";
import { MicrositeFooter } from "@/components/microsite/MicrositeFooter";
import { MicrositeWhatsAppButton } from "@/components/microsite/MicrositeWhatsAppButton";
import Script from "next/script";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) {
    return {};
  }

  const title = config.metaTitle || config.dealer.tradeName;
  const description =
    config.metaDescription ||
    `Vehículos en venta en ${config.dealer.tradeName}. Encuentra los mejores autos nuevos y usados.`;

  return {
    title: {
      default: title,
      template: `%s | ${config.dealer.tradeName}`,
    },
    description,
    icons: config.favicon
      ? { icon: [{ url: config.favicon }], apple: config.favicon }
      : undefined,
    openGraph: {
      type: "website",
      siteName: config.dealer.tradeName,
      title,
      description,
      images: config.ogImage ? [config.ogImage] : undefined,
    },
  };
}

export default async function MicrositeLayout({
  children,
  params,
}: LayoutProps) {
  const { domain } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) {
    notFound();
  }

  const cssVars = {
    "--ms-primary": config.primaryColor,
    "--ms-accent": config.accentColor,
  } as React.CSSProperties;

  return (
    <div style={cssVars} className="min-h-screen flex flex-col">
      <MicrositeHeader config={config} />
      <main className="flex-1">{children}</main>
      <MicrositeFooter config={config} />

      {config.showWhatsAppButton && config.contactWhatsApp && (
        <MicrositeWhatsAppButton
          phoneNumber={config.contactWhatsApp}
          dealerName={config.dealer.tradeName}
        />
      )}

      {config.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {config.metaPixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${config.metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </div>
  );
}
