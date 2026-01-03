import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypePrettyCode from "rehype-pretty-code";

// Extended schema to allow code highlighting classes
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), "className", "style"],
    span: [...(defaultSchema.attributes?.span || []), "className", "style"],
    pre: [...(defaultSchema.attributes?.pre || []), "className", "style", "data-language", "data-theme"],
  },
};

let processor: Awaited<ReturnType<typeof createMarkdownProcessor>> | null = null;

async function getProcessor() {
  if (!processor) {
    processor = await createMarkdownProcessor({
      shikiConfig: {
        theme: "github-dark",
      },
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: "github-dark",
            keepBackground: true,
          },
        ],
        [rehypeSanitize, sanitizeSchema],
      ],
      gfm: true,
    });
  }
  return processor;
}

export async function renderMarkdown(content: string): Promise<string> {
  if (!content) return "";
  
  try {
    const proc = await getProcessor();
    const result = await proc.render(content);
    return result.code;
  } catch (error) {
    console.error("Markdown rendering error:", error);
    // Fallback: escape HTML and preserve line breaks
    return content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }
}
