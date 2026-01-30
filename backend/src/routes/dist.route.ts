import { Hono } from "hono";
import { authMiddleware } from "@backend/middlewares/auth.middleware";
import {
  clientRoleMiddleware,
  clinAdminRoleMiddleware,
} from "@backend/middlewares/role.middleware";
import type { HonoEnv } from "@backend/types";
import {
  addDists,
  deleteDistById,
  deleteDistBySample,
  getDistBySample,
  getDists,
  updateDist,
  updateDistArray,
} from "@backend/db/query/dist.query";
import {
  DistArrayValidator,
  DistUpdateArrayValidator,
  DistUpdateValidator,
  DistValidator,
} from "@backend/validators/dist.validator";

export const dists = new Hono<HonoEnv>();

dists.use(authMiddleware);

dists.get("/", clientRoleMiddleware, async (c) => {
  try {
    const distsList = await getDists();

    return c.json(
      { message: "Fetched dists successful", body: distsList },
      201,
    );
  } catch (error) {
    console.error("Error fetching dists: ", error);
    return c.json({ error: "Failed to fetch dists" }, 500);
  }
});

dists.get("/:sampleId", clientRoleMiddleware, async (c) => {
  const sampleId = c.req.param("sampleId");

  try {
    const distsList = await getDistBySample(sampleId);

    return c.json(
      { message: "Fetched dists successful", body: distsList },
      201,
    );
  } catch (error) {
    console.error("Error fetching dists: ", error);
    return c.json({ error: "Failed to fetch dists" }, 500);
  }
});

dists.post("/create", clientRoleMiddleware, DistArrayValidator, async (c) => {
  const user = c.get("user");
  const distsList = c.req.valid("json");

  try {
    const mapdistList = distsList.map((m) => {
      return {
        ...m,
        updatedBy: user.id,
      };
    });
    const distArr = await addDists(mapdistList);

    return c.json({ message: "Created dists successful", body: distArr }, 201);
  } catch (error) {
    console.error("Error creating dists: ", error);
    return c.json({ error: "Failed to create dists" }, 500);
  }
});

dists.post(
  "/update",
  clinAdminRoleMiddleware,
  DistUpdateValidator,
  async (c) => {
    const user = c.get("user");
    const distsList = c.req.valid("json");

    try {
      const dist = await updateDist(user.id, distsList);

      return c.json({ message: "Updated dists successful", body: dist }, 201);
    } catch (error) {
      console.error("Error updating dists: ", error);
      return c.json({ error: "Failed to update dists" }, 500);
    }
  },
);

dists.post(
  "/update-many",
  clinAdminRoleMiddleware,
  DistUpdateArrayValidator,
  async (c) => {
    const user = c.get("user");
    const distsList = c.req.valid("json");

    try {
      const mapdistList = distsList.map((m) => {
        return {
          ...m,
          updatedBy: user.id,
        };
      });
      const distArr = await updateDistArray(mapdistList);

      return c.json(
        { message: "Updated dists successful", body: distArr },
        201,
      );
    } catch (error) {
      console.error("Error updating dists: ", error);
      return c.json({ error: "Failed to update dists" }, 500);
    }
  },
);

dists.delete("/delete-sample/:sampleId", clientRoleMiddleware, async (c) => {
  const sampleId = c.req.param("sampleId");

  try {
    await deleteDistBySample(sampleId);

    return c.json({ message: "Deleted dists successful" }, 201);
  } catch (error) {
    console.error("Error deleting dists: ", error);
    return c.json({ error: "Failed to delete dists" }, 500);
  }
});

dists.delete("/delete/:distId", clientRoleMiddleware, async (c) => {
  const distId = c.req.param("distId");

  try {
    await deleteDistById(distId);

    return c.json({ message: "Deleted dist successful" }, 201);
  } catch (error) {
    console.error("Error deleting dist: ", error);
    return c.json({ error: "Failed to delete dist" }, 500);
  }
});
