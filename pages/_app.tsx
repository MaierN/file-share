import "normalize.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

// TODO handle /link/:id pages

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="description" content="File transfer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
