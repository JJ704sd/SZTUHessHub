export interface LighthouseChrome {
  port: number;
  kill: () => void;
}

export interface LighthouseChromeOptions {
  chromeFlags: string[];
  userDataDir?: string;
}

export function runColdLighthouseAudit<Result>(options: {
  launchChrome: (options: LighthouseChromeOptions) => Promise<LighthouseChrome>;
  audit: (port: number) => Promise<Result>;
  closeChrome?: (port: number) => Promise<void>;
  waitForChromeToExit?: (port: number) => Promise<void>;
}): Promise<Result>;
