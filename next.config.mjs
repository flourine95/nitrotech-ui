/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'recharts',
      'date-fns',
      '@tiptap/react',
      '@tiptap/core',
      '@tiptap/extensions',
      'reactjs-tiptap-editor',
    ],
  },
};

export default nextConfig;
