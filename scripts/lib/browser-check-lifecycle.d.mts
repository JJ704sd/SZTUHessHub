export type BrowserServer = { pid?: number };

export type BrowserCheckLifecycleOptions<Stage, Server extends BrowserServer> = {
  start: () => Promise<Server>;
  waitUntilReady: (server: Server) => Promise<void>;
  stages: readonly Stage[];
  runStage: (stage: Stage) => Promise<void>;
  stop: (server: Server) => Promise<void>;
};

export function runBrowserCheckLifecycle<Stage, Server extends BrowserServer>(
  options: BrowserCheckLifecycleOptions<Stage, Server>,
): Promise<void>;
