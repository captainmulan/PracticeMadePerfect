import { createRequire } from "node:module";
import path from "node:path";

const PROJECT = "magiclibrary-143b7";
const PN = "64804616100";
const require = createRequire(
  path.join(process.env.APPDATA, "npm", "node_modules", "firebase-tools", "package.json"),
);
const auth = require("./lib/auth.js");
const token = auth.getGlobalDefaultAccount()?.tokens?.access_token;
if (!token) throw new Error("No token");

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function call(method, url, body) {
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  console.log(`\n${method} ${url.replace("https://", "").slice(0, 120)}`);
  console.log(res.status, text.slice(0, 900));
  return { status: res.status, text };
}

async function main() {
  // Enable APIs that may be needed for OAuth client creation
  for (const svc of [
    "iap.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
  ]) {
    await call(
      "POST",
      `https://serviceusage.googleapis.com/v1/projects/${PROJECT}/services/${svc}:enable`,
      {},
    );
  }

  await new Promise((r) => setTimeout(r, 5000));

  // Google Cloud OAuth Client API (newer)
  const oauthBodies = [
    {
      displayName: "Magic Library Web",
      allowedGrantTypes: ["authorization_code_grant"],
      allowedRedirectUris: [
        `https://${PROJECT}.firebaseapp.com/__/auth/handler`,
      ],
      allowedScopes: ["openid", "email", "profile"],
      clientType: "CONFIDENTIAL_CLIENT",
    },
    {
      displayName: "Magic Library Web Public",
      allowedGrantTypes: ["authorization_code_grant"],
      allowedRedirectUris: [
        `https://${PROJECT}.firebaseapp.com/__/auth/handler`,
      ],
      allowedScopes: ["openid", "email", "profile"],
      clientType: "PUBLIC_CLIENT",
    },
  ];

  for (const body of oauthBodies) {
    await call(
      "POST",
      `https://oauth2.googleapis.com/v1/projects/${PROJECT}/locations/global/oauthClients`,
      body,
    );
    await call(
      "POST",
      `https://oauth2.googleapis.com/v1/projects/${PN}/locations/global/oauthClients`,
      body,
    );
  }

  await call(
    "GET",
    `https://oauth2.googleapis.com/v1/projects/${PROJECT}/locations/global/oauthClients`,
  );

  // IAP brand after enabling API
  await call("GET", `https://iap.googleapis.com/v1/projects/${PN}/brands`);
  const brand = await call("POST", `https://iap.googleapis.com/v1/projects/${PN}/brands`, {
    applicationTitle: "Magic Library",
    supportEmail: "captainmulan@gmail.com",
  });

  let brandName = "";
  try {
    brandName = JSON.parse(brand.text).name || "";
  } catch {
    const listed = await call("GET", `https://iap.googleapis.com/v1/projects/${PN}/brands`);
    try {
      brandName = JSON.parse(listed.text).brands?.[0]?.name || "";
    } catch {
      /* ignore */
    }
  }

  if (brandName) {
    const client = await call(
      "POST",
      `https://iap.googleapis.com/v1/${brandName}/identityAwareProxyClients`,
      { displayName: "Magic Library Web" },
    );
    try {
      const parsed = JSON.parse(client.text);
      const clientId = parsed.name?.split("/").pop() || parsed.clientId;
      console.log("\nResolved clientId:", clientId);
      if (clientId) {
        const created = await call(
          "POST",
          `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/defaultSupportedIdpConfigs?idpId=google.com`,
          {
            enabled: true,
            clientId,
            clientSecret: parsed.secret || "firebase-web-client",
          },
        );
        console.log("Google IdP result", created.status);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
