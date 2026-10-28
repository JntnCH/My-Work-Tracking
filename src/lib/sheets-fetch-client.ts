/** Cloudflare Workers-compatible Google Sheets client (fetch + JWT). */
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export type SheetsAuthInput = {
  accessToken?: string;
  serviceAccountJson?: string;
  serviceAccountEmail?: string;
  serviceAccountPrivateKey?: string;
};

function serviceAccountCredentials(auth?: SheetsAuthInput, envJson?: string, fallbackJson?: string) {
  const json =
    auth?.serviceAccountJson?.trim() ||
    (typeof envJson === "string" ? envJson.trim() : "") ||
    fallbackJson ||
    "";
  let credentials: { client_email?: string; private_key?: string } = {};
  if (json) {
    try {
      credentials = JSON.parse(json);
    } catch {
      throw new Error("Google Sheets ยังไม่พร้อมใช้งาน: Service Account JSON ไม่ใช่รูปแบบ JSON ที่ถูกต้อง");
    }
  }
  const clientEmail =
    credentials.client_email ??
    auth?.serviceAccountEmail?.trim() ??
    process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"] ??
    process.env["GOOGLE_CLIENT_EMAIL"];
  const privateKey =
    credentials.private_key ??
    auth?.serviceAccountPrivateKey?.trim() ??
    process.env["GOOGLE_PRIVATE_KEY"];
  if (!clientEmail || !privateKey) {
    throw new Error("ยังไม่ได้เชื่อมต่อ Google Sheets: ตั้ง GOOGLE_SERVICE_ACCOUNT_JSON หรือแชร์สิทธิ์ชีต");
  }
  return {
    clientEmail: clientEmail.trim(),
    privateKey: privateKey.trim().replace(/\\n/g, "\n"),
  };
}

export async function getAccessToken(
  auth?: SheetsAuthInput,
  opts?: { envJson?: string; fallbackJson?: string },
): Promise<string> {
  if (auth?.accessToken && auth.accessToken.trim().length > 10) {
    return auth.accessToken.trim();
  }
  const credentials = serviceAccountCredentials(auth, opts?.envJson, opts?.fallbackJson);
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({
      iss: credentials.clientEmail,
      scope: GOOGLE_SHEETS_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");
  const unsigned = `${header}.${claim}`;
  const crypto = await import("node:crypto");
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), credentials.privateKey).toString("base64url");
  const assertion = `${unsigned}.${signature}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw Object.assign(
      new Error(tokenJson.error_description || tokenJson.error || "token exchange failed"),
      {
        code: tokenRes.status,
        response: {
          status: tokenRes.status,
          data: { error: { message: tokenJson.error_description || tokenJson.error } },
        },
      },
    );
  }
  return tokenJson.access_token;
}

async function sheetsFetch(
  accessToken: string,
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string | undefined>,
) {
  const url = new URL(`https://sheets.googleapis.com/v4/${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null && v !== "") url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: { message: text.slice(0, 300) } };
  }
  if (!res.ok) {
    const msg =
      (data as { error?: { message?: string } })?.error?.message ||
      text.slice(0, 300) ||
      res.statusText;
    throw Object.assign(new Error(msg), {
      code: res.status,
      response: { status: res.status, data },
    });
  }
  return { data };
}

export async function createSheetsClient(
  auth?: SheetsAuthInput,
  opts?: { envJson?: string; fallbackJson?: string },
) {
  const accessToken = await getAccessToken(auth, opts);
  return {
    spreadsheets: {
      get: (o: { spreadsheetId: string; fields?: string }) =>
        sheetsFetch(accessToken, "GET", `spreadsheets/${encodeURIComponent(o.spreadsheetId)}`, undefined, {
          fields: o.fields,
        }),
      create: (o: { requestBody?: unknown; fields?: string }) =>
        sheetsFetch(accessToken, "POST", "spreadsheets", o.requestBody, { fields: o.fields }),
      batchUpdate: (o: { spreadsheetId: string; requestBody?: unknown }) =>
        sheetsFetch(
          accessToken,
          "POST",
          `spreadsheets/${encodeURIComponent(o.spreadsheetId)}:batchUpdate`,
          o.requestBody,
        ),
      values: {
        get: (o: { spreadsheetId: string; range: string; valueRenderOption?: string }) =>
          sheetsFetch(
            accessToken,
            "GET",
            `spreadsheets/${encodeURIComponent(o.spreadsheetId)}/values/${encodeURIComponent(o.range)}`,
            undefined,
            { valueRenderOption: o.valueRenderOption },
          ),
        update: (o: {
          spreadsheetId: string;
          range: string;
          valueInputOption?: string;
          requestBody?: unknown;
        }) =>
          sheetsFetch(
            accessToken,
            "PUT",
            `spreadsheets/${encodeURIComponent(o.spreadsheetId)}/values/${encodeURIComponent(o.range)}`,
            o.requestBody,
            { valueInputOption: o.valueInputOption },
          ),
        append: (o: {
          spreadsheetId: string;
          range: string;
          valueInputOption?: string;
          insertDataOption?: string;
          requestBody?: unknown;
        }) =>
          sheetsFetch(
            accessToken,
            "POST",
            `spreadsheets/${encodeURIComponent(o.spreadsheetId)}/values/${encodeURIComponent(o.range)}:append`,
            o.requestBody,
            { valueInputOption: o.valueInputOption, insertDataOption: o.insertDataOption },
          ),
        clear: (o: { spreadsheetId: string; range: string; requestBody?: unknown }) =>
          sheetsFetch(
            accessToken,
            "POST",
            `spreadsheets/${encodeURIComponent(o.spreadsheetId)}/values/${encodeURIComponent(o.range)}:clear`,
            o.requestBody ?? {},
          ),
      },
    },
  };
}
