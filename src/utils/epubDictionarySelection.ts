export function watchEpubDictionarySelection(
  getDocuments: () => Iterable<Document>,
  onSelection: (text: string) => void,
  intervalMs = 100,
): () => void {
  let previousSelection = "";
  const syncSelection = () => {
    for (const doc of getDocuments()) {
      const selectedText = doc.getSelection()?.toString().trim() ?? "";
      if (!selectedText || selectedText === previousSelection) continue;
      previousSelection = selectedText;
      onSelection(selectedText);
      return;
    }
  };

  syncSelection();
  const intervalId = window.setInterval(syncSelection, intervalMs);
  return () => window.clearInterval(intervalId);
}