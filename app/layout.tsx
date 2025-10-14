import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import Script from "next/script";
import "./globals.css";

const font = Inter({ subsets: ["latin"] });

const FB_PIXEL_ID = "2448494855544504";

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
	// PWA settings
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = {
	...getSEOTags(),
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "DanceTribe",
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			data-theme={config.colors.theme}
			className={font.className}
		>
			<head>
				{/* iOS-specific PWA meta tags */}
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="DanceTribe" />
				
				{/* Apple Touch Icons for different devices */}
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167.png" />
				<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152.png" />
				<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120.png" />
				
				{/* Standard favicons */}
				<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
				<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
			</head>
			
			{/* Facebook Pixel */}
			<Script
				id="facebook-pixel"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
						!function(f,b,e,v,n,t,s)
						{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
						n.callMethod.apply(n,arguments):n.queue.push(arguments)};
						if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
						n.queue=[];t=b.createElement(e);t.async=!0;
						t.src=v;s=b.getElementsByTagName(e)[0];
						s.parentNode.insertBefore(t,s)}(window, document,'script',
						'https://connect.facebook.net/en_US/fbevents.js');
						fbq('init', '${FB_PIXEL_ID}');
						fbq('track', 'PageView');
					`,
				}}
			/>
			<noscript>
				<img
					height="1"
					width="1"
					style={{ display: "none" }}
					src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
				/>
			</noscript>
			<body>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}
