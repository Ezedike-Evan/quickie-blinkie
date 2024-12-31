import { NextRequest, NextResponse } from "next/server";
import { ActionsJson } from "@solana/actions";

import { HEADERS } from "@/app/helpers";

export async function GET() {
  const payload: ActionsJson = {
    rules: [
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
  };
  return NextResponse.json(payload, { status: 200, headers: HEADERS });
}

export const OPTIONS = GET;
