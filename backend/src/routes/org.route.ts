import { Hono } from "hono";
import {
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
} from "@/middlewares/role.middleware";
import {
  getOrgDetail,
  addNewOrg,
  updateOrg,
  getOrgMember,
  addOrgMember,
  getOrgIdBySlug,
  getOrgIdByBcode,
  deleteOrg,
} from "@/db/query/org.query";
import type { HonoEnv } from "@/types";
import { OrgMemberValidator, OrgValidator } from "@/validators/org.validator";
import { authMiddleware } from "@/middlewares/auth.middleware";

export const orgs = new Hono<HonoEnv>();

orgs.use(authMiddleware);

orgs.get("/HCode/:orgSlug", async (c) => {
  const orgSlug = c.req.param("orgSlug");

  try {
    const org = await getOrgIdBySlug(orgSlug);

    return c.json(
      {
        message: "Fetched organization id successful",
        body: org,
      },
      201,
    );
  } catch (error) {
    console.error("Error fetching organization id: ", error);
    return c.json({ error: "Failed to fetch organization id" }, 500);
  }
});

orgs.get("/BCode/:orgBcode", async (c) => {
  const orgBcode = c.req.param("orgBcode");

  try {
    const org = await getOrgIdByBcode(orgBcode);

    return c.json(
      {
        message: "Fetched organization id successful",
        body: org,
      },
      201,
    );
  } catch (error) {
    console.error("Error fetching organization id: ", error);
    return c.json({ error: "Failed to fetch organization id" }, 500);
  }
});

orgs.post("/info/:orgSlug", clientRoleMiddleware, async (c) => {
  const orgSlung = c.req.param("orgSlug");

  try {
    const orgInfo = await getOrgDetail(orgSlung);

    return c.json(
      {
        message: "Fetched organization info successful",
        body: orgInfo,
      },
      201,
    );
  } catch (error) {
    console.error("Error fetching organization info: ", error);
    return c.json({ error: "Failed to fetch organization info" }, 500);
  }
});

orgs.post("/members/:orgSlug", clientRoleMiddleware, async (c) => {
  const orgSlung = c.req.param("orgSlug");

  try {
    const orgMembers = await getOrgMember(orgSlung);

    return c.json(
      {
        message: "Fetched organization members successful",
        body: orgMembers,
      },
      201,
    );
  } catch (error) {
    console.error("Error fetching organization members: ", error);
    return c.json({ error: "Failed to fetch organization members" }, 500);
  }
});

orgs.post(
  "/create",
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
  OrgValidator,
  async (c) => {
    const user = c.get("user");
    const orgData = c.req.valid("json");

    try {
      const newOrg = await addNewOrg(user.id, orgData);

      return c.json(
        { message: "Created new organization successful", body: newOrg },
        201,
      );
    } catch (error) {
      console.error("Error creating new organization: ", error);
      return c.json({ error: "Failed to create new organization" }, 500);
    }
  },
);

orgs.post("/add-member", OrgMemberValidator, async (c) => {
  const member = c.req.valid("json");

  try {
    const newMember = await addOrgMember(member.email, member.orgSlug);

    return c.json(
      { message: "Created new member successful", body: newMember },
      201,
    );
  } catch (error) {
    console.error("Error creating new member: ", error);
    return c.json({ error: "Failed to create new member" }, 500);
  }
});

orgs.post(
  "/update",
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
  OrgValidator,
  async (c) => {
    const user = c.get("user");
    const orgData = c.req.valid("json");

    try {
      const updatedOrg = await updateOrg(user.id, orgData);

      return c.json(
        { message: "Updated organization info successful", body: updatedOrg },
        201,
      );
    } catch (error) {
      console.error("Error updating organization info: ", error);
      return c.json({ error: "Failed to update organization info" }, 500);
    }
  },
);

orgs.delete(
  "/delete/:orgId",
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
  async (c) => {
    const orgId = c.req.param("orgId");

    try {
      await deleteOrg(orgId);

      return c.json({ message: "Deleted organization successful" }, 201);
    } catch (error) {
      console.error("Error deleting organization: ", error);
      return c.json({ error: "Failed to delete organization" }, 500);
    }
  },
);
