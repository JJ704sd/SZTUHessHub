export async function runBrowserCheckLifecycle({ start, waitUntilReady, stages, runStage, stop }) {
  const server = await start();
  try {
    await waitUntilReady(server);
    for (const stage of stages) await runStage(stage);
  } finally {
    await stop(server);
  }
}
