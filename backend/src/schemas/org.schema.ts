import { z } from "zod";

export const OrgSchema = z
  .object({
    name: z.string(),
    slug: z.string().max(14, "Slug must less than 14 letters"),
    biobank: z.string().max(5, "Biobank code must less than 5 letters"),
    metadata: z.string().optional(),
  })
  .strict();

export const OrgUpdateSchema = OrgSchema.omit({ metadata: true }).extend({
  id: z.string(),
});

export const OrgMemberSchema = z.object({
  email: z.email(),
  orgSlug: z.string().max(14, "Slug must less than 14 letters"),
});
