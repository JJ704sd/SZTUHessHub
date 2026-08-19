import type { Metadata } from 'next';
import { HomeArtifactPaths, HomeDualMajorCase, HomeFeaturedProjects, HomeRecent, HomeTaskLaunchpad } from '@/components/content/home-sections';
import { getHomePageModel } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: '先看任务，再试一个小项目',
  description: '给健康工程学生的探索桌面：先看懂两个专业，试一个小项目，留下可复核的东西，再决定下一步。',
  alternates: siteConfig.isProduction ? { canonical: '/' } : undefined,
};

export default function HomePage() {
  const model = getHomePageModel();
  return <>
    <HomeTaskLaunchpad model={model} />
    <HomeDualMajorCase model={model} />
    <HomeFeaturedProjects model={model} />
    <HomeArtifactPaths model={model} />
    <HomeRecent model={model} />
  </>;
}
