import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock browser globals for TSX imports to avoid issues
if (typeof window === 'undefined') {
  (global as any).window = {};
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import data directly from source
import { SEO_CONFIG, SITE_NAME, APP_DOMAIN, THEME_COLOR, GLOBAL_OG_IMAGE } from '../src/seo/seoConfig';
import { getSoftwareAppSchema, getWebApplicationSchema, getBreadcrumbSchema, getWebSiteSchema, getHowToSchema } from '../src/seo/structuredData';
import { getFAQSchema } from '../src/utils/schema/faqSchema';
import { TOOLS } from '../src/constants/tools';

const DIST_DIR = path.join(process.cwd(), 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('Build directory or index.html not found. Run npm run build first.');
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// The Naked Template should have no SEO metadata. 
// We will strip everything that we intend to inject.
function getNakedTemplate(html: string) {
  let naked = html;
  
  // Strip JSON-LD Scripts - handles multiline and varied attribute order
  naked = naked.replace(/<script[^>]*?application\/ld\+json[^>]*?>[\s\S]*?<\/script>/gi, '');
  
  // Strip Title, Description, Keywords, Canonical
  naked = naked.replace(/<title>.*?<\/title>/gi, '');
  naked = naked.replace(/<meta name="description" content=".*?" \/>/gi, '');
  naked = naked.replace(/<meta name="keywords" content=".*?" \/>/gi, '');
  naked = naked.replace(/<link rel="canonical" href=".*?" \/>/gi, '');
  
  // Strip OG Tags and Twitter Tags more broadly
  naked = naked.replace(/<meta property="og:.*?" content=".*?" \/>/gi, '');
  naked = naked.replace(/<meta name="twitter:.*?" content=".*?" \/>/gi, '');
  naked = naked.replace(/<meta property="twitter:.*?" content=".*?" \/>/gi, '');
  
  // Strip SEO Placeholders comment and injection point
  naked = naked.replace(/<!-- SEO Placeholders -->/gi, '');
  naked = naked.replace(/<!-- SEO_METADATA_INJECTION_POINT -->/gi, '');
  
  // Clean up excessive whitespace/newlines in head
  naked = naked.replace(/<head>\s+/gi, '<head>\n');
  
  return naked;
}

const nakedTemplate = getNakedTemplate(template);

// Build the routes list dynamically
const routes: any[] = [
  { path: '/', config: SEO_CONFIG.home, type: 'home' },
  { path: '/about', config: SEO_CONFIG.about, type: 'page' },
  { path: '/contact', config: SEO_CONFIG.contact, type: 'page' },
  { path: '/privacy', config: SEO_CONFIG.privacy || { title: `Privacy Policy | ${SITE_NAME}`, description: 'Our commitment to your data security.', canonical: `${APP_DOMAIN}/privacy`, ogImage: GLOBAL_OG_IMAGE }, type: 'page' },
  { path: '/terms', config: SEO_CONFIG.terms || { title: `Terms of Service | ${SITE_NAME}`, description: 'The rules for using our platform.', canonical: `${APP_DOMAIN}/terms`, ogImage: GLOBAL_OG_IMAGE }, type: 'page' },
];

// Add tool routes from TOOLS constant
TOOLS.forEach(tool => {
  // Map tool IDs to SEO_CONFIG keys if they differ slightly
  let configKey = tool.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  if (configKey === 'imgToPdf') configKey = 'imgToPdf'; // match
  
  const seoConfig = SEO_CONFIG[configKey];
  
  routes.push({
    path: tool.href,
    config: seoConfig || {
      title: tool.seoTitle || tool.name,
      description: tool.seoDescription || tool.description,
      keywords: tool.keywords ? tool.keywords.join(', ') : '',
      canonical: `${APP_DOMAIN}${tool.href}`,
      ogImage: GLOBAL_OG_IMAGE
    },
    type: 'tool',
    toolData: tool
  });
});

function generateSchemas(route: any) {
  const schemas: any[] = [];
  const { config, type, toolData } = route;

  if (type === 'home') {
    schemas.push(getSoftwareAppSchema(config.description));
    schemas.push(getWebSiteSchema());
    schemas.push(getBreadcrumbSchema([{ name: 'Home', item: APP_DOMAIN }]));
  } else {
    // Breadcrumb for all non-home pages
    schemas.push(getBreadcrumbSchema([
      { name: 'Home', item: APP_DOMAIN },
      { name: route.config.title.split('|')[0].trim(), item: config.canonical }
    ]));

    if (type === 'tool' && toolData) {
      schemas.push(getWebApplicationSchema(config.title, config.description, config.canonical));
      if (toolData.faqs) {
        schemas.push(getFAQSchema(toolData.faqs));
      }
      if (toolData.steps) {
        schemas.push(getHowToSchema(toolData.name, toolData.description, toolData.steps));
      }
    }
  }

  return schemas;
}

console.log('Starting True Static Route Generation...');

routes.forEach((route) => {
  const { config } = route;
  const fullTitle = config.title.includes(SITE_NAME) ? config.title : `${config.title} | ${SITE_NAME}`;
  const finalOgImage = config.ogImage || GLOBAL_OG_IMAGE;
  const schemas = generateSchemas(route);

  console.log(`- Prerendering ${route.path}: ${fullTitle}`);

  // Use a fresh copy of the naked template for every route
  let html = nakedTemplate.slice(); 

  // Inject Meta Tags before </head>
  const metaTags = `
    <title>${fullTitle}</title>
    <meta name="description" content="${config.description}" />
    <meta name="keywords" content="${config.keywords || (Array.isArray(config.keywords) ? config.keywords.join(', ') : config.keywords) || ''}" />
    <link rel="canonical" href="${config.canonical}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${config.canonical}" />
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${config.description}" />
    <meta property="og:image" content="${finalOgImage}" />
    <meta property="og:image:secure_url" content="${finalOgImage}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="en_IN" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${config.canonical}" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${config.description}" />
    <meta name="twitter:image" content="${finalOgImage}" />
    <meta name="twitter:site" content="@DocBit_In" />

    <!-- Structured Data -->
    ${(() => {
      const seenTypes = new Set();
      return schemas
        .filter(s => {
          if (!s) return false;
          const type = s['@type'];
          if (!type) return true;
          if (seenTypes.has(type)) return false;
          seenTypes.add(type);
          return true;
        })
        .map(s => `<script type="application/ld+json" id="schema-${(s['@type'] || 'item').toLowerCase().replace(/[^a-z0-9]/g, '-')}" data-rh="true">${JSON.stringify(s)}</script>`)
        .join('\n    ');
    })()}
  `;

  // Inject at the top of the head for best crawler compatibility
  html = html.replace('<head>', `<head>\n    ${metaTags}`);

  // 3. Save to file
  const relativePath = route.path === '/' ? 'index.html' : path.join(route.path.startsWith('/') ? route.path.substring(1) : route.path, 'index.html');
  const outputPath = path.join(DIST_DIR, relativePath);
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, html);
});

// 4. Generate Split Sitemaps
console.log('\nGenerating Split Sitemaps...');

const today = new Date().toISOString().split('T')[0];

const generateSitemapXml = (routes: any[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${route.config.canonical}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.type === 'tool' || route.type === 'home' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route.type === 'home' ? '1.0' : route.type === 'tool' ? '0.9' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

const pagesRoutes = routes.filter(r => r.type === 'page' || r.type === 'home');
const toolsRoutes = routes.filter(r => r.type === 'tool');

fs.writeFileSync(path.join(DIST_DIR, 'sitemap-pages.xml'), generateSitemapXml(pagesRoutes));
fs.writeFileSync(path.join(DIST_DIR, 'sitemap-tools.xml'), generateSitemapXml(toolsRoutes));

// Generate Sitemap Index
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${APP_DOMAIN}/sitemap-pages.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${APP_DOMAIN}/sitemap-tools.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapIndex);
console.log('Split Sitemaps and Index generated!');

console.log('Static Generation Complete! Your dist/ directory is now SEO-ready.');
