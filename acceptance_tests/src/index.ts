import { getAppWithPlugins } from './app';

const init = async () => {
  const app = await getAppWithPlugins();
  const server = await app.start();
  console.log(`🙌 Server started at ${server.address?.toString()}`);
};

init().catch(console.error);
