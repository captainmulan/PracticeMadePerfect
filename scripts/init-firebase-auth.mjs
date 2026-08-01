import { createRequire } from "node:module";
import path from "node:path";

const PROJECT = "magiclibrary-143b7";
const PROJECT_NUMBER = "64804616100";
const require = createRequire(
  path.join(process.env.APPDATA, "npm", "node_modules", "firebase-tools", "package.json"),
);
const auth = require("./lib/auth.js");
const token = auth.getGlobalDefaultAccount()?.tokens?.access_token;
if (!token) throw new Error("No access token");

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function req(method, url, body) {
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, text: text.slice(0, 600) };
}

async function main() {
  const attempts = [
    ["POST", `https://mobilesdk-pa.googleapis.com/v1/projects/${PROJECT_NUMBER}:initializeProduct`, { productId: "auth" }],
    ["POST", `https://mobilesdk-pa.googleapis.com/v1/projects/${PROJECT}:initializeProduct`, { productId: "auth" }],
    ["POST", `https://firebase.googleapis.com/v1beta1/projects/${PROJECT}/availableLocations`, null],
    ["GET", `https://firebase.googleapis.com/v1beta1/projects/${PROJECT}`, null],
    ["POST", `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config`, {
      signIn: { email: { enabled: true, passwordRequired: true } },
      authorizedDomains: [
        "localhost",
        "magiclibrary-143b7.web.app",
        "magiclibrary-143b7.firebaseapp.com",
      ],
    }],
    ["PATCH", `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config?alt=json`, {
      signIn: { email: { enabled: true, passwordRequired: true } },
    }],
    // Legacy Firebase Auth management
    ["POST", `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=AIzaSyAldVOSqUCO41TUQ6kR5VTK3U-aAWQqGMU`, {}],
    ["GET", `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/defaultSupportedIdpConfigs`, null],
  ];

  for (const [method, url, body] of attempts) {
    const short = url.replace("https://", "").slice(0, 90);
    console.log("\n>", method, short);
    console.log(await req(method, url, body));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
