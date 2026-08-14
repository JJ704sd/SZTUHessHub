import { getHomePageModel } from '@/lib/content';
import { HomeExplore, HomeMajorCompare, HomeProjectPreviews, HomeTaskLauncher } from '@/components/content/home-sections';
import { TaskAreaViewed } from '@/components/task-area-viewed';

export default function HomePage() {
  const model = getHomePageModel();
  return <>
    <TaskAreaViewed />
    <HomeTaskLauncher model={model} />
    <HomeMajorCompare model={model} />
    <HomeProjectPreviews model={model} />
    <HomeExplore model={model} />
  </>;
}
