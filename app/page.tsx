import { getHomePageModel } from '@/lib/content';
import { HomeCapabilityShortcuts, HomeExplore, HomeMajorCompare, HomeProjectPreviews, HomeTaskLauncher } from '@/components/content/home-sections';

export default function HomePage() {
  const model = getHomePageModel();
  return <>
    <HomeTaskLauncher model={model} />
    <HomeMajorCompare model={model} />
    <HomeCapabilityShortcuts model={model} />
    <HomeProjectPreviews model={model} />
    {model.showExploreSection ? <HomeExplore model={model} /> : null}
  </>;
}
