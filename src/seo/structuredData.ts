
import { APP_DOMAIN, SITE_NAME } from './seoConfig';

export const getSoftwareAppSchema = (description: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": SITE_NAME,
    "url": APP_DOMAIN,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };
};

export const getWebApplicationSchema = (name: string, description: string, url: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${name} | ${SITE_NAME}`,
    "url": url,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };
};

export const getBreadcrumbSchema = (items: { name: string; item: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };
};

export const getWebSiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": APP_DOMAIN,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${APP_DOMAIN}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};

export const getHowToSchema = (name: string, description: string, steps: { name: string; text: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    }))
  };
};

export const getCollectionPageSchema = (name: string, description: string, url: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url
  };
};
