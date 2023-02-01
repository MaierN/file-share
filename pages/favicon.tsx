import Head from "next/head";
import { MdOutlineDescription } from "react-icons/md";

export default function Home() {
  return (
    <>
      <Head>
        <title>File Transfer</title>
      </Head>
      <div
        style={{
          display: "flex",
          backgroundColor: "white",
          padding: 100,
        }}
      >
        <div
          style={{
            backgroundColor: "#101010",
            borderRadius: "50%",
            padding: 16,
            height: 500,
            width: 500,
            boxSizing: "border-box",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MdOutlineDescription size={64 * 5} />
        </div>
      </div>
    </>
  );
}
