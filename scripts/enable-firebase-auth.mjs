import { createRequire } from "node:module";
import path from "node:path";

const PROJECT = "magiclibrary-143b7";
const require = createRequire(
  path.join(process.env.APPDATA, "npm", "node_modules", "firebase-tools", "package.json"),
);
const auth = require("./lib/auth.js");
const token = auth.getGlobalDefaultAccount()?.tokens?.access_token;
if (!token) {
  throw new Error("No Firebase CLI access token. Run firebase login.");
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function post(url, body = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, text };
}

async function patch(url, body) {
  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, text };
}

async function get(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  return { status: res.status, text };
}

async function main() {
  console.log("1) Enable Identity Toolkit API");
  console.log(
    await post(
      `https://serviceusage.googleapis.com/v1/projects/${PROJECT}/services/identitytoolkit.googleapis.com:enable`,
    ),
  );

  console.log("2) Initialize Auth / Identity Platform");
  for (const url of [
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/identityPlatform:initializeAuth`,
    `https://identitytoolkit.googleapis.com/v2/projects/${PROJECT}/identityPlatform:initializeAuth`,
  ]) {
    console.log(url, await post(url));
  }

  // Wait briefly for config propagation
  await new Promise((r) => setTimeout(r, 3000));

  console.log("3) Read config");
  const cfg = await get(`https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config`);
  console.log(cfg.status, cfg.text.slice(0, 500));

  console.log("4) Enable email/password");
  console.log(
    await patch(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config?updateMask=signIn.email`,
      { signIn: { email: { enabled: true, passwordRequired: true } } },
    ),
  );

  console.log("5) Find OAuth clients for Google IdP");
  const projectNumber = "64804616100";
  const clients = await get(
    `https://oauth2.googleapis.com/v1/...`,
  ).catch(() => null);
  void clients;

  // Firebase-managed OAuth clients often appear under clientauthconfig / cloudresourcemanager
  const brandClients = await get(
    `https://clientauthconfig.googleapis.com/v1/clients?filter=project_number=${projectNumber}`,
  );
  console.log("clients", brandClients.status, brandClients.text.slice(0, 800));

  // Also try listing via Google Cloud API
  const list2 = await get(
    `https://iam.googleapis.com/v1/projects/${PROJECT}/serviceAccounts`,
  );
  console.log("serviceAccounts", list2.status, list2.text.slice(0, 200));

  // Create Google IdP if we can discover a Web client id
  let clientId = "";
  try {
    const parsed = JSON.parse(brandClients.text);
    const list = parsed.client || parsed.clients || [];
    const web = list.find((c) =>
      String(c.clientType || c.type || "").toLowerCase().includes("web"),
    ) || list[0];
    clientId = web?.clientId || web?.client_id || "";
  } catch {
    /* ignore */
  }

  if (!clientId) {
    console.log("6) No OAuth client id found yet — try enabling Google without secret (Firebase default)");
  } else {
    console.log("6) Using clientId", clientId.slice(0, 12) + "…");
  }

  const googleBody = clientId
    ? { enabled: true, clientId, clientSecret: "unused-for-web-popup" }
    : { enabled: true };

  const gGet = await get(
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/defaultSupportedIdpConfigs/google.com`,
  );
  console.log("google get", gGet.status, gGet.text.slice(0, 300));

  if (gGet.status === 404) {
    const created = await post(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/defaultSupportedIdpConfigs?idpId=google.com`,
      googleBody,
    );
    console.log("google create", created.status, created.text.slice(0, 500));
  } else {
    const updated = await patch(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/defaultSupportedIdpConfigs/google.com?updateMask=enabled`,
      { enabled: true },
    );
    console.log("google patch", updated.status, updated.text.slice(0, 500));
  }

  console.log("7) Final config check");
  const finalCfg = await get(`https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config`);
  console.log(finalCfg.status, finalCfg.text.slice(0, 800));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
