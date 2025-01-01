import { createActionHeaders } from "@solana/actions";
import { clusterApiUrl } from "@solana/web3.js";

// CONSTANTS
export const TIP_AMOUNT = 0.005;
export const URL_PATH = "/api/actions";
export const CLUSTER_URL = clusterApiUrl("devnet");
export const HEADERS = createActionHeaders({
  chainId: "devnet",
  actionVersion: "2.2",
});

export const fetchMint = async () => {
  const response = await fetch(process.env.QUICKNODE_FUNCTION_URL as string, {
    method: "POST",
    redirect: "follow",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": process.env.QUICKNODE_API_KEY as string,
    },
  });
  const data = await response.json();
  console.log({ data, response });
  return data.mint[0];
};

export const fetchTokenData = async (tokenMint: string) => {
  const response = await fetch(process.env.RPC_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "text",
      method: "getAsset",
      params: { id: tokenMint },
    }),
  });

  const data = await response.json();
  const address = data.result.id;
  const imageURL = data.result.content.links.image;
  const { name, symbol, description } = data.result.content.metadata;
  const { supply, decimals, price_info } = data.result.token_info;
  const marketcap = (supply * price_info.price_per_token) / 10 ** decimals;

  return {
    address,
    imageURL,
    name,
    symbol,
    description,
    marketcap,
  };
};
