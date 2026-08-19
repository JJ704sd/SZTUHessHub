export const projectIntents = ['quick-look', 'data-ai', 'sensor', 'portfolio'] as const;
export type ProjectIntent = (typeof projectIntents)[number];
