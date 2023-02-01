import "normalize.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// TODO favicon

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="description" content="File transfer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable={false}
        transition={Slide}
        pauseOnHover
        theme="dark"
        hideProgressBar
      />
    </>
  );
}
