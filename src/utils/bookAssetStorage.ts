import type { Course } from "../data/courses";
import { getLocalBookAssetUrl } from "../config/externalHosting";
import { bookStorageCategory, normalizeBookStorageFolder } from "./htmlStepContent";

const DATABASE_NAME = "pmp-book-asset-storage";
const STORE_NAME = "settings";
const DIRECTORY_KEY = "asset-directory";

type PermissionDirectoryHandle = FileSystemDirectoryHandle & {
  queryPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
  requestPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
};

export async function assertProjectAssetRoot(directory: FileSystemDirectoryHandle): Promise<void> {
  if (directory.name !== "PracticeMadePerfect") {
    throw new Error("Select the PracticeMadePerfect project folder. Book assets are stored under its book_html folder.");
  }
  try {
    await directory.getDirectoryHandle("src", { create: false });
    await directory.getDirectoryHandle("book_html", { create: false });
    await directory.getFileHandle("package.json", { create: false });
  } catch {
    throw new Error("The selected folder is not the PracticeMadePerfect project root; book assets were not changed.");
  }
}

export async function resolveProjectBookDirectory(
  projectRoot: FileSystemDirectoryHandle,
  folderName: string,
  create: boolean,
): Promise<FileSystemDirectoryHandle> {
  await assertProjectAssetRoot(projectRoot);
  const pathParts = folderName.replace(/\\/g, "/").split("/").filter(Boolean);
  if (
    !/^(Comic|Other)$/i.test(pathParts[0] ?? "") ||
    pathParts.some((part) => part === "." || part === "..")
  ) {
    throw new Error("Book assets must be stored under book_html/Comic or book_html/Other.");
  }
  return pathParts.reduce(
    (directory, part) => directory.then((current) => current.getDirectoryHandle(part, { create })),
    Promise.resolve(await projectRoot.getDirectoryHandle("book_html", { create: false })),
  );
}

function openAssetStorageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function rememberBookAssetDirectory(directory: FileSystemDirectoryHandle): Promise<void> {
  await assertProjectAssetRoot(directory);
  const db = await openAssetStorageDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(directory, DIRECTORY_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  }).finally(() => db.close());
}

export async function selectProjectAssetDirectory(): Promise<FileSystemDirectoryHandle> {
  const picker = window.showDirectoryPicker;
  if (!picker) {
    throw new Error("This browser cannot select the PracticeMadePerfect project folder.");
  }
  const directory = await picker({ mode: "readwrite" });
  await assertProjectAssetRoot(directory);
  await rememberBookAssetDirectory(directory);
  return directory;
}

async function loadBookAssetDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openAssetStorageDb();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(DIRECTORY_KEY);
      request.onsuccess = () => resolve((request.result as FileSystemDirectoryHandle | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

async function requestBookAssetDirectory(): Promise<FileSystemDirectoryHandle> {
  const saved = await loadBookAssetDirectory();
  const picker = window.showDirectoryPicker;
  if (!saved && !picker) {
    throw new Error("No saved PracticeMadePerfect asset folder is available. The book was not deleted.");
  }
  const directory = saved ?? await picker!({ mode: "readwrite" });
  await assertProjectAssetRoot(directory);
  const permissionHandle = directory as PermissionDirectoryHandle;
  let permission = await permissionHandle.queryPermission?.({ mode: "readwrite" });
  if (permission !== "granted") {
    permission = await permissionHandle.requestPermission?.({ mode: "readwrite" });
  }
  if (permission && permission !== "granted") {
    throw new Error("Folder access was not granted; the book and its asset file were not deleted.");
  }
  if (!saved) await rememberBookAssetDirectory(directory);
  return directory;
}

export function getBookAssetFiles(course: Course): Array<{ name: string; folder: string }> {
  const courseFolder = course.bookHtmlFolder
    ? normalizeBookStorageFolder(course.bookHtmlFolder)
    : "";
  const categoryRoot = bookStorageCategory([course.category, course.cat1, course.cat2, course.cat3, course.cat4].filter(Boolean).join(","));

  const files = new Map<string, { name: string; folder: string }>();
  for (const step of course.chapters.flatMap((chapter) => chapter.steps)) {
    if ((step.stepType !== "epub" && step.stepType !== "pdf") || !step.contentHtml) continue;
    const iframeSrc = step.contentHtml.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1];
    const source = iframeSrc ?? step.contentHtml;
    let pathname: string;
    try {
      const localAssetUrl = getLocalBookAssetUrl(source) ?? source;
      pathname = new URL(localAssetUrl, window.location.href).pathname;
    } catch {
      continue;
    }
    const pathParts = pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
    const name = pathParts.pop() ?? "";
    if (!/\.(?:epub|pdf)$/i.test(name)) continue;
    const bookHtmlIndex = pathParts.findIndex((part) => part.toLowerCase() === "book_html");
    if (bookHtmlIndex < 0) continue;
    const urlParts = pathParts.slice(bookHtmlIndex + 1);
    const urlFolder = urlParts.join("/");
    if (!/^(Comic|Other)\//i.test(urlFolder)) continue;
    const urlCategory = urlFolder.split("/")[0];
    if (urlCategory.toLowerCase() !== categoryRoot.toLowerCase()) continue;
    if (courseFolder && urlFolder.toLowerCase() !== courseFolder.toLowerCase()) continue;
    files.set(`${urlFolder.toLowerCase()}/${name.toLowerCase()}`, { name, folder: urlFolder });
  }
  return [...files.values()];
}

export async function deleteLocalBookAssets(
  course: Course,
  selectedRoot?: FileSystemDirectoryHandle,
): Promise<void> {
  const files = getBookAssetFiles(course);
  const hasExternalBookSteps = course.chapters
    .flatMap((chapter) => chapter.steps)
    .some((step) => step.stepType === "epub" || step.stepType === "pdf");
  if (!files.length) {
    if (hasExternalBookSteps) {
      throw new Error("Could not identify this book's saved EPUB/PDF file from its page source. Nothing was deleted.");
    }
    return;
  }

  const root = selectedRoot ?? await requestBookAssetDirectory();
  await assertProjectAssetRoot(root);
  const bookFolders = [...new Set(files.map((file) => file.folder))];
  for (const folder of bookFolders) {
    const pathParts = folder.replace(/\\/g, "/").split("/").filter(Boolean);
    const bookFolderName = pathParts.pop();
    if (!bookFolderName || pathParts.length < 1) {
      throw new Error("The book's saved folder path is invalid; no folders were deleted.");
    }
    const categoryFolder = await resolveProjectBookDirectory(root, pathParts.join("/"), false);
    try {
      await categoryFolder.removeEntry(bookFolderName, { recursive: true });
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== "NotFoundError") throw error;
    }
  }
}

declare global {
  interface Window {
    showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<FileSystemDirectoryHandle>;
  }
}