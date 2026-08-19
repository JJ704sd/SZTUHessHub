export const siteConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hseehub.example',
  currentCohort: '2025',
  contentBaseline: '2026-08-18',
  projectDataLabels: {
    kind: { none: '无外部数据', synthetic: '合成数据', real: '真实世界数据' },
    access: { none: '无访问要求', open: '公开可用', restricted: '受控访问', credentialed: '需要账号或凭据' },
    sensitivity: { none: '无敏感信息', personal: '个人信息', health: '健康信息', commercial: '商业敏感信息', 'security-relevant': '安全相关信息' },
  },
  navItems: [
    { href: '/majors', label: '专业' },
    { href: '/projects', label: '小项目' },
    { href: '/capabilities', label: '能力' },
    { href: '/pathways', label: '下一步' },
  ],
} as const;
