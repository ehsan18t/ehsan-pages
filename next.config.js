/** @type {import('next').NextConfig} */
const nextConfig = {
  head: {
    meta: [
      {
        name: 'color-scheme',
        content: 'dark',
      },
      {
        name: 'darkreader-lock',
      },
    ],
  },
};

module.exports = nextConfig;
