import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_NAME, APP_DOMAIN, THEME_COLOR } from '../seo/seoConfig';
import { StructuredData } from './StructuredData';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  schema?: object | object[];
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  canonical, 
  keywords, 
  ogImage, 
  ogType = 'website',
  schema,
  noindex = false
}) => {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  
  // Robust canonical calculation
  const getSafeCanonical = () => {
    if (canonical) return canonical;
    if (typeof window !== 'undefined') {
      return window.location.origin + window.location.pathname.replace(/\/$/, "");
    }
    return APP_DOMAIN;
  };

  const finalCanonical = getSafeCanonical();
  const finalOgImage = ogImage || 'https://res.cloudinary.com/dlesei0kn/image/upload/v1778091011/og_docbit_cebbib.jpg';

  return (
    <>
    <Helmet>
      {/* Indexing */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="theme-color" content={THEME_COLOR} />

      {/* Canonical */}
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:image:secure_url" content={finalOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalOgImage} />
      <meta name="twitter:site" content="@DocBit_In" />

      {/* Trust Signals & Mobile Optimization */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
    </Helmet>
    <StructuredData data={schema} />
  </>
);
};