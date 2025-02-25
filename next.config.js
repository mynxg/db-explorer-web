/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.bilibili.com', 'i0.hdslb.com'],
  },
  typescript: {
    // !! 警告 !!
    // 仅在开发过程中临时使用此选项
    // 这样做会完全禁用 TypeScript 错误报告
    ignoreBuildErrors: true,
  },
  eslint: {
    // 仅在开发过程中临时使用此选项
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig