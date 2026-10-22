import { expect, test } from "@playwright/test";

test("deep link opens the project window on that project; Back returns to the list", async ({
  page,
}) => {
  await page.goto("/projects/aurore");
  const projects = page.getByRole("dialog", { name: "Projects" });
  await expect(projects).toBeVisible();
  await expect(
    projects.getByRole("heading", { name: "Aurore – E-commerce Headless" }),
  ).toBeVisible();

  await projects.getByRole("button", { name: /Tất cả project/ }).click();
  await expect(page).toHaveURL(/\/projects$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/projects\/aurore$/);
  await expect(
    projects.getByRole("heading", { name: "Aurore – E-commerce Headless" }),
  ).toBeVisible();
});

test("opening and focusing windows updates the URL; Back and Forward follow it", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "About", exact: true }).dblclick();
  await expect(page).toHaveURL(/\/about$/);
  await page.locator('[data-app-id="contact"]').focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contact$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.goForward();
  await expect(page.getByRole("dialog", { name: "About" })).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  // Checks what a reader (or crawler) actually sees, not just text somewhere in the payload.
  for (const [path, window, text] of [
    ["/about", "About", "Đại học Sài Gòn"],
    ["/experience", "Experience", "HTX Vận Tải 9"],
    ["/projects/ecommerce-backend-api", "Projects", "SELECT ... FOR UPDATE"],
    ["/contact", "Contact", "buithach.it@gmail.com"],
  ] as const) {
    test(`${path} is server-rendered and readable`, async ({ page }) => {
      await page.goto(path);
      const dialog = page.getByRole("dialog", { name: window });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText(text).first()).toBeVisible();
    });
  }
});

test("unknown paths show the ThạchOS 404", async ({ page, request }) => {
  expect((await request.get("/nope")).status()).toBe(404);
  await page.goto("/projects/does-not-exist");
  await expect(page.getByText("app not found")).toBeVisible();
});

test("sitemap lists every project route", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const slug of ["thachos", "ecommerce-backend-api", "aurore"]) {
    expect(xml).toContain(`/projects/${slug}</loc>`);
  }
});
