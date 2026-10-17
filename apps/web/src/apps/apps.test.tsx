// @vitest-environment jsdom
import type { Experience, Project } from "@portfolio/shared";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWindowsApi, WindowsProvider } from "@/stores/WindowsProvider";
import type { WindowsStore } from "@/stores/windows";
import { AboutApp } from "./about/AboutApp";
import { ContactApp } from "./contact/ContactApp";
import { ExperienceApp } from "./experience/ExperienceApp";
import { ProjectsApp } from "./projects/ProjectsApp";
import type { Rendered } from "./types";

const profile = {
  name: "Bùi Công Thạch",
  title: "Fullstack Developer",
  tagline: "Xây web nhanh.",
  location: "Hồ Chí Minh",
  links: { email: "a@example.com", github: "https://github.com/example" },
};

const project = (slug: string, data: Partial<Project>): Rendered<Project> => ({
  slug,
  body: <p>Case study {slug}</p>,
  data: {
    title: slug.toUpperCase(),
    summary: `Tóm tắt ${slug}`,
    stack: ["Next.js"],
    role: "Fullstack",
    year: 2025,
    links: {},
    featured: false,
    order: 1,
    ...data,
  },
});

const projects = [
  project("alpha", { order: 1, stack: ["Next.js", "Stripe"] }),
  project("beta", {
    order: 2,
    featured: true,
    stack: ["Express", "PostgreSQL"],
    links: { demo: "https://demo.example" },
  }),
  project("gamma", { order: 3, stack: ["Next.js", "PostgreSQL"] }),
];

afterEach(cleanup);

/** Project card by its accessible name (the cover placeholder is aria-hidden). */
const card = (title: string) => screen.queryByRole("link", { name: title });

describe("AboutApp", () => {
  it("shows the profile, body and skills grouped by count", () => {
    render(
      <WindowsProvider>
        <AboutApp
          profile={profile}
          body={<p>Giới thiệu dài</p>}
          skills={[
            { count: 3, skills: ["Next.js"] },
            { count: 1, skills: ["Docker"] },
          ]}
        />
      </WindowsProvider>,
    );
    expect(screen.getByRole("heading", { name: "Bùi Công Thạch" })).toBeTruthy();
    expect(screen.getByText("Giới thiệu dài")).toBeTruthy();
    expect(screen.getByText("3 nơi").nextElementSibling?.textContent).toBe("Next.js");
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it("opens the Projects window from its button", async () => {
    const user = userEvent.setup();
    let store: WindowsStore | undefined;
    const Probe = () => {
      store = useWindowsApi();
      return null;
    };
    render(
      <WindowsProvider>
        <Probe />
        <AboutApp profile={profile} body={null} skills={[]} />
      </WindowsProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Xem Projects/ }));
    expect(store!.getState().windows.map((w) => w.appId)).toEqual(["projects"]);
  });
});

describe("ProjectsApp", () => {
  it("lists featured projects first, then by order", () => {
    render(<ProjectsApp projects={projects} />);
    const cards = screen.getAllByRole("listitem").filter((li) => li.querySelector("a"));
    expect(cards.map((c) => within(c).getAllByText(/^[A-Z]+$/)[0]?.textContent)).toEqual([
      "BETA",
      "ALPHA",
      "GAMMA",
    ]);
  });

  it("filters by every selected stack chip", async () => {
    const user = userEvent.setup();
    render(<ProjectsApp projects={projects} />);
    await user.click(screen.getByRole("button", { name: "PostgreSQL" }));
    expect(card("ALPHA")).toBeNull();
    expect(card("BETA")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Next.js" }));
    expect(card("BETA")).toBeNull();
    expect(card("GAMMA")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next.js" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("opens a project's case study inside the window and goes back", async () => {
    const user = userEvent.setup();
    render(<ProjectsApp projects={projects} />);
    await user.click(card("BETA")!);
    expect(screen.getByText("Case study beta")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Demo/ }).getAttribute("href")).toBe(
      "https://demo.example",
    );
    await user.click(screen.getByRole("button", { name: /Tất cả project/ }));
    expect(card("ALPHA")).toBeTruthy();
  });

  it("can start on a given project", () => {
    render(<ProjectsApp projects={projects} initialSlug="gamma" />);
    expect(screen.getByText("Case study gamma")).toBeTruthy();
  });
});

describe("ExperienceApp", () => {
  it("renders the timeline with periods and durations", () => {
    const items: Rendered<Experience>[] = [
      {
        slug: "now",
        body: <p>Việc hiện tại</p>,
        data: { company: "Now Co", role: "Dev", start: "2026-10", end: "present", stack: ["Go"] },
      },
      {
        slug: "old",
        body: <p>Việc cũ</p>,
        data: {
          company: "Old Co",
          role: "Intern",
          start: "2025-04",
          end: "2025-07",
          stack: ["Next.js"],
        },
      },
    ];
    render(<ExperienceApp items={items} now={new Date(2026, 9, 17)} />);
    const entries = screen.getAllByRole("article");
    expect(entries[0]?.textContent).toContain("Now Co");
    expect(entries[0]?.textContent).toContain("10/2026 – Hiện tại · Dưới 1 tháng");
    expect(entries[1]?.textContent).toContain("04/2025 – 07/2025 · 4 tháng");
    expect(screen.getByText("Việc cũ")).toBeTruthy();
  });
});

describe("ContactApp", () => {
  it("links email and GitHub, hides missing LinkedIn", () => {
    render(<ContactApp links={profile.links} />);
    expect(screen.getByRole("link", { name: "a@example.com" }).getAttribute("href")).toBe(
      "mailto:a@example.com",
    );
    expect(screen.getByRole("link", { name: "github.com/example" })).toBeTruthy();
    expect(screen.queryByText("LinkedIn")).toBeNull();
  });

  it("copies the email and announces it", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<ContactApp links={profile.links} />);
    await user.click(screen.getByRole("button", { name: "Copy email" }));
    expect(writeText).toHaveBeenCalledWith("a@example.com");
    expect(screen.getByRole("status").textContent).toBe("Đã copy!");
  });
});

describe("ProjectsApp focus", () => {
  it("returns focus to the card after going back, and doesn't steal focus on a deep link", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ProjectsApp projects={projects} initialSlug="alpha" />);
    expect(document.activeElement).toBe(document.body);
    unmount();

    render(<ProjectsApp projects={projects} />);
    await user.click(card("GAMMA")!);
    expect(document.activeElement?.textContent).toContain("Tất cả project");
    await user.click(screen.getByRole("button", { name: /Tất cả project/ }));
    expect(document.activeElement).toBe(card("GAMMA"));
  });

  it("collapses long stacks into +N but keeps the full list for screen readers", () => {
    const many = project("delta", { stack: ["A", "B", "C", "D", "E", "F", "G"] });
    render(<ProjectsApp projects={[many]} />);
    const button = screen.getByRole("link", { description: /Công nghệ: A, B, C, D, E, F, G/ });
    expect(button.textContent).toContain("+2");
    // Only phrasing content inside a button.
    expect(button.querySelector("ul, li, div, p, h1, h2, h3")).toBeNull();
  });
});
