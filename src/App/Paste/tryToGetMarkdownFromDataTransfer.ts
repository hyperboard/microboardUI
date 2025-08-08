import {
  transformHtmlOrTextToMarkdown,
  EditorContainer,
} from "microboard-temp";

const isMarkdown = (text: string): boolean => {
  if (!text) {
    return false;
  }

  const markdownPatterns = [
    /^#{1,6}\s.+/m, // (# H1, ## H2, ...)
    /^\s*[-*]\s.+/m, // (* item, - item)
    /^\s*\d+\.\s.+/m, // (1. item)
    /\*\*[^*]+\*\*/, // (**bold**)
    /(^|\s)\*[^*]+\*(\s|$)/, // (*italic*)
    /__(.*?)__/, // (__bold__)
    /(^|\s)_[^_]+_(\s|$)/, // (_italic_)
    /~~[^~]+~~/, // (~~strikethrough~~)
    /\[.+\]\(.+\)/, // [text](url)
    /!\[.*?\]\(.*?\)/, // ![alt](url)
    /^> .+/m, // (> quote)
    /^```[\s\S]*```$/m, // (```code```)
    /^-{3,}$/m, // (---)
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
};

export async function tryToGetMarkdownFromDataTransfer(
  dataTransfer: DataTransfer,
  textEditor?: EditorContainer,
): Promise<DataTransfer | null> {
  const html = dataTransfer?.getData("text/html");
  const text = dataTransfer?.getData("text/plain");

  const shouldSkipMarkdownTransform = Boolean(
    textEditor?.getSelection() &&
      textEditor?.hasTextInSelection() &&
      window.MICROBOARD_CONFIG.URL_REGEX.test(text),
  );

  if (
    !dataTransfer?.getData("application/x-slate-fragment") &&
    !shouldSkipMarkdownTransform
  ) {
    try {
      if (!isMarkdown(text) && html) {
        return transformHtmlOrTextToMarkdown(text, html);
      } else {
        return transformHtmlOrTextToMarkdown(text);
      }
    } catch (err) {
      console.warn("Error while parsing html to markdown", err);
      return null;
    }
  }
  return null;
}
