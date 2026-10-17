import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderMdx } from "./mdx";

describe("renderMdx", () => {
  it("renders Markdown and inline JSX", async () => {
    const element = await renderMdx("## Vấn đề\n\n- **Nhanh**\n\n<span>jsx</span>");
    const html = renderToStaticMarkup(element);
    expect(html).toContain("<h2>Vấn đề</h2>");
    expect(html).toContain("<strong>Nhanh</strong>");
    expect(html).toContain("<span>jsx</span>");
  });

  it("uses custom components", async () => {
    const element = await renderMdx("## Title", { h2: (props) => <h2 className="x" {...props} /> });
    expect(renderToStaticMarkup(element)).toBe('<h2 class="x">Title</h2>');
  });
});
