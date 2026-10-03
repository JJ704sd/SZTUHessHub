import { Fragment } from 'react';
import type { Metadata } from 'next';
import { HomeArtifactPaths, HomeDualMajorCase, HomeFeaturedProjects, HomeRecent, HomeTaskLaunchpad } from '@/components/content/home-sections';
import { getHomePageModel } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { getMajorsPageModel } from '@/lib/content';
import { CurriculumNavigator } from '@/components/content/curriculum-navigator';

export const metadata: Metadata = {
  title: '先看任务，再试一个小项目',
  description: '给健康工程学生的探索桌面：先看懂两个专业，试一个小项目，留下可复核的东西，再决定下一步。',
  alternates: siteConfig.isProduction ? { canonical: '/' } : undefined,
};

export default function HomePage() {
  const model = getHomePageModel();
  const sections = {
    launch: <HomeTaskLaunchpad model={model} />,
    discover: <><HomeDualMajorCase model={model} /><div className="page-container"><CurriculumNavigator majors={getMajorsPageModel().majors} compact /></div></>,
    projects: <><HomeFeaturedProjects model={model} /><HomeArtifactPaths model={model} /></>,
    trust: <HomeRecent model={model} />,
  };
  return <>
    {model.homeComposition.sectionOrder.map((section) => <Fragment key={section}>{sections[section]}</Fragment>)}
  </>;
}
