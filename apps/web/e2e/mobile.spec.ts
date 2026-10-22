import { expect, type Page, test } from "@playwright/test";

const APPS = ["About", "Projects", "Experience", "Contact"] as const;
const appIcon = (page: Page, name: string) => page.locator(`[data-app-id="${name.toLowerCase()}"]`);
const visibleDialog = (page: Page) => page.locator('[role="dialog"]:visible');

test("Projects → detail → Back to the list → Back to the home screen", async ({ page }) => {
  await page.goto("/");
  await appIcon(page, "Projects").tap();
  const projects = page.getByRole("dialog", { name: "Projects" });
  await expect(projects).toBeVisible();
  // Full screen: the window covers the whole viewport.
  expect(await projects.boundingBox()).toMatchObject({ x: 0, y: 0, width: 390, height: 844 });

  await projects.getByRole("link", { name: "Aurore – E-commerce Headless" }).tap();
  await expect(
    projects.getByRole("heading", { name: "Aurore – E-commerce Headless" }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(projects.getByRole("link", { name: "Aurore – E-commerce Headless" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(visibleDialog(page)).toHaveCount(0);
  await expect(appIcon(page, "Projects")).toBeVisible();
});

test("Back after a deep link returns to the home screen instead of leaving", async ({ page }) => {
  await page.goto("/experience");
  await expect(page.getByRole("dialog", { name: "Experience" })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(visibleDialog(page)).toHaveCount(0);
});

test("the in-app back button goes home", async ({ page }) => {
  await page.goto("/");
  await appIcon(page, "Contact").tap();
  await page
    .getByRole("dialog", { name: "Contact" })
    .getByRole("button", { name: "Quay lại" })
    .tap();
  await expect(visibleDialog(page)).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
});

test("only one app shows at a time", async ({ page }) => {
  await page.goto("/about");
  await page
    .getByRole("dialog", { name: "About" })
    .getByRole("button", { name: /Xem Projects/ })
    .tap();
  await expect(visibleDialog(page)).toHaveCount(1);
  await expect(page.getByRole("dialog", { name: "Projects" })).toBeVisible();
});

for (const name of APPS) {
  test(`${name}: no horizontal scroll, touch targets ≥ 44px`, async ({ page }) => {
    await page.goto(`/${name.toLowerCase()}`);
    const dialog = page.getByRole("dialog", { name });
    await expect(dialog).toBeVisible();

    const overflow = await page.evaluate(() => {
      const scrollers = [
        document.documentElement,
        ...document.querySelectorAll<HTMLElement>("[role=dialog] *"),
      ];
      return scrollers
        .filter(
          (el) =>
            el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== "hidden",
        )
        .filter((el) => el.clientWidth > 0)
        .map((el) => `${el.tagName}.${el.className}`.slice(0, 80));
    });
    expect(overflow).toEqual([]);

    // Buttons, and links that stand on their own (not inside running text).
    const small = await dialog.evaluate((root) =>
      [...root.querySelectorAll<HTMLElement>("button, a")]
        .filter((el) => el.offsetParent !== null)
        .filter(
          (el) => !(el.tagName === "A" && el.closest("p, li")?.textContent !== el.textContent),
        )
        .map((el) => ({
          text: el.textContent?.trim().slice(0, 30),
          ...el.getBoundingClientRect().toJSON(),
        }))
        .filter((r) => r.height < 44 || r.width < 44),
    );
    expect(small).toEqual([]);
  });
}

test("switches layout when the viewport changes", async ({ page }) => {
  await page.goto("/about");
  const about = page.getByRole("dialog", { name: "About" });
  expect((await about.boundingBox())?.width).toBe(390);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect.poll(async () => (await about.boundingBox())?.width).toBe(640);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => (await about.boundingBox())?.width).toBe(390);
});
