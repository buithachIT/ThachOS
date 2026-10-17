import { z } from "zod";

/** Month in `YYYY-MM` form, e.g. `2023-04`. */
export const yearMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Phải có dạng YYYY-MM, ví dụ 2023-04");

const stackSchema = z.array(z.string().min(1)).min(1);

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  location: z.string().min(1),
  avatar: z.string().startsWith("/").optional(),
  links: z.object({
    email: z.email(),
    github: z.url(),
    linkedin: z.url().optional(),
    website: z.url().optional(),
  }),
});

export const experienceSchema = z
  .object({
    company: z.string().min(1),
    role: z.string().min(1),
    start: yearMonthSchema,
    end: z.union([yearMonthSchema, z.literal("present")]),
    stack: stackSchema,
  })
  .refine((e) => e.end === "present" || e.end >= e.start, {
    message: "end không được trước start",
    path: ["end"],
  });

export const projectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  stack: stackSchema,
  role: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  links: z
    .object({
      demo: z.url().optional(),
      repo: z.url().optional(),
    })
    .default({}),
  cover: z.string().startsWith("/").optional(),
  featured: z.boolean().default(false),
  order: z.number().int(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;

/** A parsed content file: validated frontmatter plus the raw MDX body. */
export type ContentEntry<T> = { slug: string; data: T; body: string };
