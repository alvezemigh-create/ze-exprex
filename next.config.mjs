/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.tabacariadamata.com.br" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "i.ibb.co.com" },
      { protocol: "https", hostname: "http2.mlstatic.com" },
      { protocol: "https", hostname: "images.multipedidos.com.br" },
      { protocol: "https", hostname: "**.zecheguei24h.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
