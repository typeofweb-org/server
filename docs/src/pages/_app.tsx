import type { AppComponent } from 'next/dist/next-server/lib/router/router';
import '../styles/globals.scss';

const App: AppComponent = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default App;
