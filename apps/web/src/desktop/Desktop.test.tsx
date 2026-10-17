// @vitest-environment jsdom
import { APPS } from "@portfolio/shared";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Desktop } from "./Desktop";
import { openApp } from "./open-app";
import { THEME_STORAGE_KEY } from "./theme";

vi.mock("./open-app", () => ({ openApp: vi.fn() }));

function mockSystemTheme(dark: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: dark,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

beforeEach(() => {
  mockSystemTheme(false);
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("Desktop icons", () => {
  it("renders one button per registered app", () => {
    render(<Desktop />);
    const list = screen.getByRole("list", { name: "Ứng dụng" });
    expect(list.querySelectorAll("button")).toHaveLength(4);
    for (const app of APPS) {
      expect(screen.getByRole("button", { name: app.title })).toBeTruthy();
    }
  });

  it.each(APPS.map((a) => [a.id, a.title]))("Enter on %s calls openApp", async (id, title) => {
    const user = userEvent.setup();
    render(<Desktop />);
    screen.getByRole("button", { name: title }).focus();
    await user.keyboard("{Enter}");
    expect(openApp).toHaveBeenCalledExactlyOnceWith(id);
  });

  it("Tab reaches the icons and Enter opens the focused one", async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    // Theme toggle first (system bar), then the icons in registry order.
    await user.tab();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Projects" }));
    await user.keyboard("{Enter}");
    expect(openApp).toHaveBeenCalledWith("projects");
  });

  it("single click only selects; double-click opens", async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    const about = screen.getByRole("button", { name: "About" });
    await user.click(about);
    expect(openApp).not.toHaveBeenCalled();
    await user.dblClick(about);
    expect(openApp).toHaveBeenCalledWith("about");
  });
});

describe("Selection", () => {
  it("clears on Escape and on a click outside the icons", async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    const about = screen.getByRole("button", { name: "About" });
    const isSelected = () => about.querySelector(".border-accent") !== null;
    await user.click(about);
    expect(isSelected()).toBe(true);
    await user.keyboard("{Escape}");
    expect(isSelected()).toBe(false);
    await user.click(about);
    await user.click(screen.getByRole("list", { name: "Ứng dụng" }));
    expect(isSelected()).toBe(false);
  });
});

describe("Theme toggle", () => {
  it("follows the system, then saves the viewer's choice", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();
    render(<Desktop />);
    await user.click(screen.getByRole("button", { name: "Chuyển sang giao diện sáng" }));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Chuyển sang giao diện tối" })).toBeTruthy();
  });

  it("still switches when localStorage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const user = userEvent.setup();
    render(<Desktop />);
    await user.click(screen.getByRole("button", { name: "Chuyển sang giao diện tối" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
