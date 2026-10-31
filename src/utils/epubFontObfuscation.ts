const ADOBE_FONT_OBFUSCATION = "http://ns.adobe.com/pdf/enc#RC";
const ADOBE_FONT_KEY_LENGTH = 1024;

type EpubZipFile = {
  async(type: "string"): Promise<string>;
  async(type: "uint8array"): Promise<Uint8Array>;
};

type EpubZip = {
  file(path: string): EpubZipFile | null;
  file(path: string, data: Uint8Array): EpubZip;
  generateAsync(options: { type: "uint8array" }): Promise<Uint8Array>;
};

type EpubZipConstructor = {
  loadAsync(buffer: ArrayBuffer): Promise<EpubZip>;
};

function parseXml(xml: string, label: string): Document {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror")) {
    throw new Error(`Unable to read EPUB ${label}.`);
  }
  return document;
}

function resolveArchivePath(path: string): string {
  const resolved = new URL(path, "https://epub.invalid/");
  return decodeURIComponent(resolved.pathname.slice(1));
}

async function adobeFontKeys(zip: EpubZip): Promise<Uint8Array[] | null> {
  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) return null;

  const container = parseXml(await containerFile.async("string"), "container metadata");
  const packageReference = container.getElementsByTagNameNS("*", "rootfile")[0]?.getAttribute("full-path");
  if (!packageReference) return null;

  const packageFile = zip.file(packageReference);
  if (!packageFile) return null;
  const packageDocument = parseXml(await packageFile.async("string"), "package metadata");
  const uniqueIdentifierId = packageDocument.documentElement.getAttribute("unique-identifier");
  const identifier = Array.from(packageDocument.getElementsByTagNameNS("*", "identifier"))
    .find((element) => element.getAttribute("id") === uniqueIdentifierId)
    ?.textContent?.trim();
  const uuid = identifier?.replace(/^urn:uuid:/i, "").replace(/-/g, "");
  if (!uuid || !/^[0-9a-f]{32}$/i.test(uuid)) return null;

  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(uuid));
  const uuidBytes = Uint8Array.from(uuid.match(/../g) ?? [], (byte) => Number.parseInt(byte, 16));
  return [new Uint8Array(digest), uuidBytes];
}

function hasSfntSignature(bytes: Uint8Array): boolean {
  const signatures = [
    [0x00, 0x01, 0x00, 0x00],
    [0x4f, 0x54, 0x54, 0x4f],
    [0x74, 0x72, 0x75, 0x65],
    [0x74, 0x79, 0x70, 0x31],
    [0x74, 0x74, 0x63, 0x66],
  ];
  return signatures.some((signature) => signature.every((byte, index) => bytes[index] === byte));
}

export async function decryptAdobeObfuscatedEpubFonts(buffer: ArrayBuffer): Promise<ArrayBuffer> {
  const JSZip = (window as Window & { JSZip?: EpubZipConstructor }).JSZip;
  if (!JSZip) return buffer;

  const zip = await JSZip.loadAsync(buffer);
  const encryptionFile = zip.file("META-INF/encryption.xml");
  if (!encryptionFile) return buffer;

  const encryptionDocument = parseXml(await encryptionFile.async("string"), "font encryption metadata");
  const encryptedFontPaths = Array.from(encryptionDocument.getElementsByTagNameNS("*", "EncryptedData"))
    .filter((encryptedData) =>
      encryptedData.getElementsByTagNameNS("*", "EncryptionMethod")[0]?.getAttribute("Algorithm") === ADOBE_FONT_OBFUSCATION,
    )
    .map((encryptedData) => encryptedData.getElementsByTagNameNS("*", "CipherReference")[0]?.getAttribute("URI"))
    .filter((uri): uri is string => Boolean(uri))
    .map(resolveArchivePath);
  if (encryptedFontPaths.length === 0) return buffer;

  const keys = await adobeFontKeys(zip);
  if (!keys) return buffer;

  let fontDecrypted = false;
  for (const fontPath of encryptedFontPaths) {
    const fontFile = zip.file(fontPath);
    if (!fontFile) continue;

    const encryptedBytes = await fontFile.async("uint8array");
    for (const key of keys) {
      const fontBytes = encryptedBytes.slice();
      const decryptedLength = Math.min(ADOBE_FONT_KEY_LENGTH, fontBytes.length);
      for (let index = 0; index < decryptedLength; index += 1) {
        fontBytes[index] ^= key[index % key.length];
      }
      if (!hasSfntSignature(fontBytes)) continue;

      zip.file(fontPath, fontBytes);
      fontDecrypted = true;
      break;
    }
  }
  if (!fontDecrypted) return buffer;

  const output = await zip.generateAsync({ type: "uint8array" });
  const result = new ArrayBuffer(output.byteLength);
  new Uint8Array(result).set(output);
  return result;
}