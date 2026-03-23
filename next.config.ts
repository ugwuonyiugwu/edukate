/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com", // For your user profile pictures
      },
      {
        protocol: "https",
        hostname: "utfs.io", // For older UploadThing URLs
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh", // For the new UploadThing CDN (Fixes your error)
      },
    ],
  },
};

export default nextConfig;