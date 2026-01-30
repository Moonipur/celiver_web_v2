import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import {
  clientRoleMiddleware,
  adminRoleMiddleware,
} from "@/middlewares/role.middleware";
import {
  addCases,
  deleteCase,
  getCaseByOrgSlug,
  getCaseClinByOrgSlug,
  getCaseLatestByOrgSlug,
  getCases,
  updateCaseByBcode,
  validOrg,
} from "@/db/query/case.query";
import type { HonoEnv } from "@/types";
import {
  CaseUpdateClinValidator,
  CaseUpdateValidator,
  CasesArrayValidator,
} from "@/validators/case.validator";

export const cases = new Hono<HonoEnv>();

cases.use(authMiddleware);

cases.get("/", clientRoleMiddleware, async (c) => {
  try {
    const casesList = await getCases();

    return c.json(
      { message: "Fetched cases successful", body: casesList },
      201,
    );
  } catch (error) {
    console.error("Error fetching cases: ", error);
    return c.json({ error: "Failed to fetch cases" }, 500);
  }
});

cases.get("/:orgSlug", clientRoleMiddleware, async (c) => {
  const orgSlug = c.req.param("orgSlug");

  try {
    const casesList = await getCaseByOrgSlug(orgSlug);

    return c.json({ message: "Fetched cases successful", body: casesList });
  } catch (error) {
    console.error("Error fetching cases: ", error);
    return c.json({ error: "Failed to fetch cases" }, 500);
  }
});

cases.get("/latest/:orgSlug", clientRoleMiddleware, async (c) => {
  const orgSlug = c.req.param("orgSlug");

  try {
    const casesList = await getCaseLatestByOrgSlug(orgSlug);

    return c.json({ message: "Fetched cases successful", body: casesList });
  } catch (error) {
    console.error("Error fetching cases: ", error);
    return c.json({ error: "Failed to fetch cases" }, 500);
  }
});

cases.get(
  "/clin/:orgSlug",
  clientRoleMiddleware,
  adminRoleMiddleware,
  async (c) => {
    const orgSlug = c.req.param("orgSlug");

    try {
      const casesList = await getCaseClinByOrgSlug(orgSlug);

      return c.json({ message: "Fetched cases successful", body: casesList });
    } catch (error) {
      console.error("Error fetching cases: ", error);
      return c.json({ error: "Failed to fetch cases" }, 500);
    }
  },
);

cases.post("/create", CasesArrayValidator, async (c) => {
  const user = c.get("user");
  const casesList = c.req.valid("json");

  try {
    const validCode = await Promise.all(
      casesList.map(async (m) => {
        const v = await validOrg(m.hospitalId, m.hospitalCode, m.biobankCode);
        return v;
      }),
    );

    if (!validCode.every(Boolean)) {
      return c.json({ error: "Invalid of Hospital or Biobank code" }, 400);
    }

    const mapCasesList = casesList.map((m) => {
      return {
        ...m,
        updatedBy: user.id,
      };
    });
    const caseArr = await addCases(mapCasesList);

    return c.json({ message: "Created cases successful", body: caseArr }, 201);
  } catch (error) {
    console.error("Error creating cases: ", error);
    return c.json({ error: "Failed to create cases" }, 500);
  }
});

cases.post(
  "/update/:bCode",
  clientRoleMiddleware,
  CaseUpdateValidator,
  async (c) => {
    const user = c.get("user");
    const caseData = c.req.valid("json");

    try {
      const updatedCase = await updateCaseByBcode(user.id, caseData);

      return c.json(
        { message: "Updated case successful", body: updatedCase },
        201,
      );
    } catch (error) {
      console.error("Error updating case: ", error);
      return c.json({ error: "Failed to update case" }, 500);
    }
  },
);

cases.post(
  "/update-clin/:bCode",
  clientRoleMiddleware,
  adminRoleMiddleware,
  CaseUpdateClinValidator,
  async (c) => {
    const user = c.get("user");
    const caseData = c.req.valid("json");

    try {
      const updatedCase = await updateCaseByBcode(user.id, caseData);

      return c.json(
        { message: "Updated case successful", body: updatedCase },
        201,
      );
    } catch (error) {
      console.error("Error updating case: ", error);
      return c.json({ error: "Failed to update case" }, 500);
    }
  },
);

cases.delete("/delete/:caseId", clientRoleMiddleware, async (c) => {
  const caseId = c.req.param("caseId");

  try {
    await deleteCase(caseId);

    return c.json({ message: "Deleted case successful" }, 201);
  } catch (error) {
    console.error("Error deleting case: ", error);
    return c.json({ error: "Failed to delete case" }, 500);
  }
});
