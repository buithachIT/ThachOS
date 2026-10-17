import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import * as runtime from "react/jsx-runtime";

/**
 * Compile an MDX body to a React element on the server.
 * Content comes from our own repo, so evaluating it is trusted.
 */
export async function renderMdx(body: string, components?: MDXComponents) {
  const { default: Content } = await evaluate(body, { ...runtime, baseUrl: import.meta.url });
  return <Content components={components} />;
}
