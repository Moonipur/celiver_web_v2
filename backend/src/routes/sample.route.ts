import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import {
  adminRoleMiddleware,
  clientRoleMiddleware,
  clinAdminRoleMiddleware,
} from "@/middlewares/role.middleware";
import type { HonoEnv } from "@/types";
import {
  SamplesArrayValidator,
  SampleUpdateDataValidator,
  SampleUpdateDistValidator,
  SampleUpdateExtractValidator,
} from "@/validators/sample.validator";
import {
  addSamples,
  deleteSample,
  getDupSample,
  getOneSample,
  getSampleByLotNBcode,
  getSampleByOrgSlug,
  getSampleLatestOrder,
  getSamples,
  updateSampleData,
  updateSampleDist,
  updateSampleExtract,
} from "@/db/query/sample.query";

export const samples = new Hono<HonoEnv>();

samples.use(authMiddleware);

samples.get("/", clientRoleMiddleware, async (c) => {
  try {
    const samplesList = await getSamples();

    return c.json(
      { message: "Fetched samples successful", body: samplesList },
      201,
    );
  } catch (error) {
    console.error("Error fetching samples: ", error);
    return c.json({ error: "Failed to fetch samples" }, 500);
  }
});

samples.get("/:orgSlug", clientRoleMiddleware, async (c) => {
  const orgSlug = c.req.param("orgSlug");

  try {
    const samplesList = await getSampleByOrgSlug(orgSlug);

    return c.json({ message: "Fetched samples successful", body: samplesList });
  } catch (error) {
    console.error("Error fetching samples: ", error);
    return c.json({ error: "Failed to fetch samples" }, 500);
  }
});

samples.get("/latest/:orderId", clientRoleMiddleware, async (c) => {
  const orderId = c.req.param("orderId");

  try {
    const samplesList = await getSampleLatestOrder(orderId);

    return c.json({ message: "Fetched samples successful", body: samplesList });
  } catch (error) {
    console.error("Error fetching samples: ", error);
    return c.json({ error: "Failed to fetch samples" }, 500);
  }
});

samples.get("/one/:orderId/:bCode", clientRoleMiddleware, async (c) => {
  const { orderId, bCode } = c.req.param();

  try {
    const samplesList = await getOneSample(orderId, bCode);

    return c.json({ message: "Fetched samples successful", body: samplesList });
  } catch (error) {
    console.error("Error fetching samples: ", error);
    return c.json({ error: "Failed to fetch samples" }, 500);
  }
});

samples.get("/getSample/:lotId/:bCode", clientRoleMiddleware, async (c) => {
  const { lotId, bCode } = c.req.param();

  try {
    const samplesList = await getSampleByLotNBcode(lotId, bCode);

    return c.json({ message: "Fetched samples successful", body: samplesList });
  } catch (error) {
    console.error("Error fetching samples: ", error);
    return c.json({ error: "Failed to fetch samples" }, 500);
  }
});

samples.get("/dup/:hCode", async (c) => {
  const hCode = c.req.param("hCode");

  try {
    const samplesList = await getDupSample(hCode);

    return c.json({ message: "Fetched samples successful", body: samplesList });
  } catch (error) {
    console.error("Error fetching samples: ", error);
    return c.json({ error: "Failed to fetch samples" }, 500);
  }
});

samples.post("/create", SamplesArrayValidator, async (c) => {
  const user = c.get("user");
  const samplesList = c.req.valid("json");

  try {
    const mapsamplesList = samplesList.map((m) => {
      return {
        ...m,
        updatedBy: user.id,
      };
    });
    const sampleArr = await addSamples(mapsamplesList);

    return c.json(
      { message: "Created samples successful", body: sampleArr },
      201,
    );
  } catch (error) {
    console.error("Error creating samples: ", error);
    return c.json({ error: "Failed to create samples" }, 500);
  }
});

samples.post(
  "/update",
  clientRoleMiddleware,
  SampleUpdateDataValidator,
  async (c) => {
    const user = c.get("user");
    const samplesList = c.req.valid("json");

    try {
      const updatedSample = await updateSampleData(user.id, samplesList);

      return c.json(
        { message: "Created samples successful", body: updatedSample },
        201,
      );
    } catch (error) {
      console.error("Error creating samples: ", error);
      return c.json({ error: "Failed to create samples" }, 500);
    }
  },
);

samples.post(
  "/update-extract",
  clientRoleMiddleware,
  SampleUpdateExtractValidator,
  async (c) => {
    const user = c.get("user");
    const samplesList = c.req.valid("json");

    try {
      const updatedSample = await updateSampleExtract(user.id, samplesList);

      return c.json(
        { message: "Created samples successful", body: updatedSample },
        201,
      );
    } catch (error) {
      console.error("Error creating samples: ", error);
      return c.json({ error: "Failed to create samples" }, 500);
    }
  },
);

samples.post(
  "/update-dist",
  clientRoleMiddleware,
  SampleUpdateDistValidator,
  async (c) => {
    const user = c.get("user");
    const samplesList = c.req.valid("json");

    try {
      const updatedSample = await updateSampleDist(user.id, samplesList);

      return c.json(
        { message: "Created samples successful", body: updatedSample },
        201,
      );
    } catch (error) {
      console.error("Error creating samples: ", error);
      return c.json({ error: "Failed to create samples" }, 500);
    }
  },
);

samples.delete(
  "/delete/:sampleId",
  clientRoleMiddleware,
  adminRoleMiddleware,
  clinAdminRoleMiddleware,
  async (c) => {
    const sampleId = c.req.param("sampleId");

    try {
      await deleteSample(sampleId);

      return c.json({ message: "Deleted sample successful" }, 201);
    } catch (error) {
      console.error("Error deleting sample: ", error);
      return c.json({ error: "Failed to delete sample" }, 500);
    }
  },
);
