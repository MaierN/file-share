// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

const asdf = {
  c: 1,
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  asdf.c++;
  res.status(200).json({ name: "John Doe" + asdf.c });
}
