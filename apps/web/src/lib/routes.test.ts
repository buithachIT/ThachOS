import { describe, expect, it } from "vitest";
import type { WindowState } from "@/stores/windows";
import type { InitialWindow } from "@/stores/windows";
import { allPaths, parsePath, pathForWindows, pathOf } from "./routes";

const win = (appId: WindowState["appId"], z: number, extra: Partial<WindowState> = {}) =>
  ({
    id: appId,
    appId,
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    z,
    minimized: false,
    maximized: false,
    ...extra,
  }) as WindowState;

describe("parsePath / pathOf", () => {
  it.each<[string, InitialWindow | null | undefined]>([
    ["/", null],
    ["/about", { appId: "about" }],
    ["/projects/aurore", { appId: "projects", subpath: "aurore" }],
    ["/nope", undefined],
    ["/about/extra", undefined],
    ["/projects/a/b", undefined],
  ])("%s", (path, expected) => {
    expect(parsePath(path)).toEqual(expected);
    if (expected !== undefined) expect(pathOf(expected)).toBe(path);
  });
});

describe("pathForWindows", () => {
  it("follows the top visible window, including its subpath", () => {
    expect(pathForWindows([])).toBe("/");
    expect(pathForWindows([win("about", 1), win("projects", 2, { subpath: "x" })])).toBe(
      "/projects/x",
    );
    expect(pathForWindows([win("about", 1), win("contact", 2, { minimized: true })])).toBe(
      "/about",
    );
  });
});

describe("allPaths", () => {
  it("lists home, every app and every project", () => {
    expect(allPaths(["a", "b"])).toEqual([
      [],
      ["about"],
      ["projects"],
      ["experience"],
      ["contact"],
      ["projects", "a"],
      ["projects", "b"],
    ]);
  });
});
