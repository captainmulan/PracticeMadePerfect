import { rm } from "node:fs/promises";

await rm(".firebase/hosting.ZGlzdA.cache", { force: true });
