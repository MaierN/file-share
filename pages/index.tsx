import Head from "next/head";
import { Poppins } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { SocketHandler } from "../components/SocketHandler";
import Index from "../components/Index/Index";

const poppins = Poppins({ weight: "400", subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>File Transfer</title>
      </Head>
      <main className={`${styles.main} ${poppins.className}`}>
        <SocketHandler>
          <Index />
        </SocketHandler>
      </main>
    </>
  );
}
