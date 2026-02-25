import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    async redirects() {
        return [
            {
                source: "/",
                destination: "/en",
                permanent: false,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: "/en",
                destination: "/",
            },
            {
                source: "/ur",
                destination: "/",
            },
            {
                source: "/de",
                destination: "/",
            },
            {
                source: "/fr",
                destination: "/",
            },
            {
                source: "/es",
                destination: "/",
            },
            {
                source: "/en/:path*",
                destination: "/:path*",
            },
            {
                source: "/ur/:path*",
                destination: "/:path*",
            },
            {
                source: "/de/:path*",
                destination: "/:path*",
            },
            {
                source: "/fr/:path*",
                destination: "/:path*",
            },
            {
                source: "/es/:path*",
                destination: "/:path*",
            },
        ];
    },
};

export default nextConfig;
