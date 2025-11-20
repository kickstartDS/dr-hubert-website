const cspHeader = `
    default-src 'self';
    connect-src 'self' https://usage.ruhmesmeile.com https://helpdesk.drhubert.de;
    style-src-elem 'self' 'unsafe-inline' https://usage.ruhmesmeile.com https://helpdesk.drhubert.de;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.storyblok.com https://code.jquery.com https://helpdesk.drhubert.de;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://a.storyblok.com;
    media-src 'self' blob: data: https://a.storyblok.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors https://app.storyblok.com;
    block-all-mixed-content;
    upgrade-insecure-requests;
`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@kickstartds/base",
    "@kickstartds/blog",
    "@kickstartds/content",
    "@kickstartds/core",
    "@kickstartds/form",
    "@kickstartds/ds-agency-premium",
  ],
  output: "standalone",
};

module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, ""),
          },
        ],
      },
    ];
  },
  ...nextConfig,
};
