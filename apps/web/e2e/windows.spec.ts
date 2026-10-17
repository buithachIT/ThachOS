import { expect, type Page, test } from "@playwright/test";

/** Desktop icon by exact name (window content may contain buttons like "Xem Projects"). */
const icon = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).first();

const titleBar = (page: Page, name: string) =>
  page.getByRole("dialog", { name }).locator("[data-window-titlebar]");

async function drag(page: Page, name: string, dx: number, dy: number, steps = 10) {
  const box = (await titleBar(page, name).boundingBox())!;
  const x = box.x + 60;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps });
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("About reopens where it was dragged to", async ({ page }) => {
  await icon(page, "About").dblclick();
  const about = page.getByRole("dialog", { name: "About" });
  await expect(about).toBeVisible();
  const before = (await about.boundingBox())!;

  await drag(page, "About", 240, 120);
  const moved = (await about.boundingBox())!;
  expect(moved.x - before.x).toBeCloseTo(240, 0);
  expect(moved.y - before.y).toBeCloseTo(120, 0);

  await about.getByRole("button", { name: "Đóng" }).click();
  await expect(about).toBeHidden();

  await icon(page, "About").dblclick();
  const reopened = (await page.getByRole("dialog", { name: "About" }).boundingBox())!;
  expect(reopened.x).toBeCloseTo(moved.x, 0);
  expect(reopened.y).toBeCloseTo(moved.y, 0);
});

test("layout survives a reload, the open-window list does not", async ({ page }) => {
  await icon(page, "Contact").dblclick();
  await drag(page, "Contact", 150, 80);
  const moved = (await page.getByRole("dialog", { name: "Contact" }).boundingBox())!;

  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await icon(page, "Contact").dblclick();
  const reopened = (await page.getByRole("dialog", { name: "Contact" }).boundingBox())!;
  expect(reopened.x).toBeCloseTo(moved.x, 0);
  expect(reopened.y).toBeCloseTo(moved.y, 0);
});

test("resize from the bottom-right corner respects the minimum size", async ({ page }) => {
  await icon(page, "Experience").dblclick();
  const win = page.getByRole("dialog", { name: "Experience" });
  const box = (await win.boundingBox())!;
  await page.mouse.move(box.x + box.width - 3, box.y + box.height - 3);
  await page.mouse.down();
  await page.mouse.move(box.x + 50, box.y + 50, { steps: 5 });
  await page.mouse.up();
  const resized = (await win.boundingBox())!;
  expect(resized.width).toBeCloseTo(320, 0);
  expect(resized.height).toBeCloseTo(240, 0);
});

test("four windows drag smoothly", async ({ page }) => {
  for (const name of ["About", "Projects", "Experience", "Contact"]) {
    await page.locator(`[data-app-id="${name.toLowerCase()}"]`).dblclick();
  }
  await expect(page.getByRole("dialog")).toHaveCount(4);

  // Record frame intervals while dragging every window back and forth.
  await page.evaluate(() => {
    const w = window as unknown as { frames: number[]; stop: boolean };
    w.frames = [];
    w.stop = false;
    let last = performance.now();
    const tick = (now: number) => {
      w.frames.push(now - last);
      last = now;
      if (!w.stop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  for (const name of ["Contact", "Experience", "Projects", "About"]) {
    await drag(page, name, 200, 60, 30);
    await drag(page, name, -200, -60, 30);
  }
  const frames = await page.evaluate(() => {
    const w = window as unknown as { frames: number[]; stop: boolean };
    w.stop = true;
    return w.frames.slice(1).sort((a, b) => a - b);
  });

  // 90th percentile frame under 50ms (≥ 20fps) even on a slow CI runner; locally it's ~16ms.
  const p90 = frames[Math.floor(frames.length * 0.9)]!;
  console.log(
    `drag frames: n=${frames.length} p50=${frames[Math.floor(frames.length / 2)]?.toFixed(1)}ms p90=${p90.toFixed(1)}ms`,
  );
  expect(p90).toBeLessThan(50);
});
