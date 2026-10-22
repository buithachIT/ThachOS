// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Desktop } from "@/desktop/Desktop";
import { windowsStore } from "@/stores/windows";

function Boom(): never {
  throw new Error("boom");
}

beforeEach(() => {
  window.matchMedia = (() => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
  localStorage.clear();
  windowsStore.getState().closeAll();
});

afterEach(cleanup);

describe("windows on the desktop", () => {
  it("opens a labelled dialog from an icon and focuses it", async () => {
    const user = userEvent.setup();
    render(<Desktop apps={{ about: <p>Nội dung About</p> }} />);
    await user.dblClick(screen.getByRole("button", { name: "About" }));

    const dialog = screen.getByRole("dialog", { name: "About" });
    expect(dialog.textContent).toContain("Nội dung About");
    expect(document.activeElement).toBe(dialog);
    expect(screen.getByRole("navigation", { name: "Cửa sổ đang mở" }).textContent).toContain(
      "About",
    );
  });

  it("Escape closes the window and returns focus to its icon", async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    const icon = screen.getByRole("button", { name: "Contact" });
    icon.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "Contact" })).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(icon);
  });

  it("opening an app that is already open moves focus into its window", async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    const icon = screen.getByRole("button", { name: "About" });
    await user.dblClick(icon);
    icon.focus();
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("dialog", { name: "About" })),
    );
  });

  it("minimize hands focus to the next window", async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    await user.dblClick(screen.getByRole("button", { name: "About" }));
    await user.dblClick(screen.getByRole("button", { name: "Contact" }));
    const contact = screen.getByRole("dialog", { name: "Contact" });
    await user.click(within(contact).getByRole("button", { name: "Thu nhỏ" }));
    expect(document.activeElement).toBe(screen.getByRole("dialog", { name: "About" }));
  });

  it("minimize hides the window and the taskbar restores it", async () => {
    const user = userEvent.setup();
    render(<Desktop />);
    await user.dblClick(screen.getByRole("button", { name: "Projects" }));
    await user.click(screen.getByRole("button", { name: "Thu nhỏ" }));
    expect(screen.queryByRole("dialog")).toBeNull(); // display: none

    const taskbar = screen.getByRole("navigation", { name: "Cửa sổ đang mở" });
    await user.click(taskbar.querySelector("button")!);
    expect(screen.getByRole("dialog", { name: "Projects" })).toBeTruthy();
  });

  it("a crashing app shows an error in its own window, the desktop keeps working", async () => {
    const user = userEvent.setup();
    const consoleError = console.error;
    console.error = () => {}; // React logs the caught error
    try {
      render(<Desktop apps={{ about: <Boom /> }} />);
      await user.dblClick(screen.getByRole("button", { name: "About" }));
      expect(screen.getByRole("alert").textContent).toContain("About gặp lỗi");

      await user.dblClick(screen.getByRole("button", { name: "Contact" }));
      expect(screen.getByRole("dialog", { name: "Contact" })).toBeTruthy();
    } finally {
      console.error = consoleError;
    }
  });
});
