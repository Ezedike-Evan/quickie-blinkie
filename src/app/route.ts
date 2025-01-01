import { NextRequest, NextResponse } from "next/server";
import {
  ActionError,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createPostResponse,
} from "@solana/actions";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  CLUSTER_URL,
  HEADERS,
  TIP_AMOUNT,
  fetchMint,
  fetchTokenData,
} from "@/app/helpers";

const TO_PUBKEY = new PublicKey(process.env.PROGRAM_ACCOUNT!);

export async function GET(req: NextRequest) {
  const tokenMint = await fetchMint();
  const { address, imageURL, name, symbol, description, marketcap } =
    await fetchTokenData(tokenMint);

  const payload: ActionGetResponse = {
    title: "New Token Alert",
    icon: imageURL,
    description: `\n\nName: ${name}\n\nSymbol: \$${symbol.toUpperCase()}\n\nDescription: ${description}\n\nAddress: ${address}\n\nMarket Cap: \$${parseFloat(
      marketcap.toString()
    ).toFixed(
      2
    )}\n\nhttps://pump.fun/coin/${address}\n\nIf you liked this, please tip me!`,
    label: "Great job, dev!",
  };

  return NextResponse.json(payload, { status: 200, headers: HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body: ActionPostRequest = await req.json();
    if (!body.account?.trim()) throw new Error("`account` field is required");

    let payer: PublicKey;
    try {
      payer = new PublicKey(body.account);
    } catch (err: any) {
      console.log(err);
      throw new Error("Invalid account provided: not a valid public key");
    }

    const connection = new Connection(CLUSTER_URL);
    const { blockhash } = await connection.getLatestBlockhash();

    const sendTip = SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: TO_PUBKEY,
      lamports: TIP_AMOUNT * LAMPORTS_PER_SOL,
    });

    const message = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhash,
      instructions: [sendTip],
    }).compileToV0Message();

    const tx = new VersionedTransaction(message);

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction: tx,
        message: "Thank you, ser!",
      },
    });

    return NextResponse.json(payload, { status: 200, headers: HEADERS });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message } as ActionError, {
      status: 400,
      headers: HEADERS,
    });
  }
}

export const OPTIONS = GET;
