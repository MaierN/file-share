import Head from "next/head";
import Index from "../../components/Index/Index";

export default function Link() {
  return (
    <>
      <Head>
        <title>File Transfer</title>
      </Head>
      <Index link={true} />
    </>
  );
}
