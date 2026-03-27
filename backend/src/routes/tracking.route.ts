import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth.middleware";
import type { HonoEnv } from "@/types";
import { clientRoleMiddleware } from "@/middlewares/role.middleware";
import { getOrderByLotId, getOrders } from "@/db/query/order.query";
import {
  getOneSample,
  getSampleByOrderId,
} from "@/db/query/sample.query";
import { getMember } from "@/db/query/org.query";
import { StatusClassify, TrackingStatus } from "@/lib/utils";
import { TrackingUpdateValidator } from "@/validators/tracking.validator";
import {
  canceledLot,
  updateAnalyzed,
  updateDelivered,
  updateDistributed,
  updateExtracted,
  updateShipped,
} from "@/db/query/tracking.query";

export const tracking = new Hono<HonoEnv>();

tracking.use(authMiddleware);

tracking.get("/", clientRoleMiddleware, async (c) => {
  try {
    const orderList = await getOrders();
    const trackPromises = orderList.map(async (item) => {
      const org = await getMember(item.orderedBy!);
      const sampleList = await getSampleByOrderId(item.id);

      return {
        lotId: item.lot,
        customerName: org.userName,
        status:
          item.canceled === true
            ? "canceled"
            : StatusClassify(
                sampleList[0].receivedCheck,
                sampleList[0].extractedCheck,
                sampleList[0].distRunCheck,
                sampleList[0].predictedCheck,
              ),
        orderDate: item.orderedAt,
        lastLocation: org.name,
      };
    });

    const track = await Promise.all(trackPromises);

    return c.json({ message: "Fetched orders successful", body: track });
  } catch (error) {
    console.error("Error fetching orders: ", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

tracking.get("/:lotId", clientRoleMiddleware, async (c) => {
  const lotId = c.req.param("lotId");

  try {
    const lot = await getOrderByLotId(lotId);
    const orderedUser = await getMember(lot.orderedBy!);
    const sampleList = await getSampleByOrderId(lot.id);
    const receivedById = sampleList[0]?.receivedBy;
    const extractedById = sampleList[0]?.extractedBy;
    const distRunById = sampleList[0]?.distRunBy;
    const predictedById = sampleList[0]?.predictedBy;
    let receivedUser = null;
    let extractedUser = null;
    let distRunUser = null;
    let predictedUser = null;

    if (receivedById) {
      receivedUser = await getMember(receivedById);
    }

    if (extractedById) {
      extractedUser = await getMember(extractedById);
    }

    if (distRunById) {
      distRunUser = await getMember(distRunById);
    }

    if (predictedById) {
      predictedUser = await getMember(predictedById);
    }

    const tracking = TrackingStatus(
      sampleList,
      orderedUser,
      receivedUser,
      extractedUser,
      distRunUser,
      predictedUser,
    );

    const trackingInfo = {
      id: lotId,
      canceled: lot.canceled,
      customer: orderedUser.hCode,
      currentStatus: tracking.currentStatus,
      lastUpdate: tracking.lastUpdate,
      history: tracking.history,
    };

    return c.json({ message: "Fetched orders successful", body: trackingInfo });
  } catch (error) {
    console.error("Error fetching orders: ", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

tracking.post(
  "/update/:lotId",
  clientRoleMiddleware,
  TrackingUpdateValidator,
  async (c) => {
    const user = c.get("user");
    const { lotId } = c.req.param();

    try {
      const lot = await getOrderByLotId(lotId);
      const newData = c.req.valid("json");

      await Promise.all(
        newData.qData.map(async (item) => {
          const sample = await getOneSample(lot.id, item.code);

          if (newData.stageLabel == "shipped") {
            await updateShipped(user.id, sample.id, item.note);
          } else if (newData.stageLabel == "delivered") {
            await updateDelivered(user.id, sample.id, item.pass, item.note);
          } else if (newData.stageLabel == "extracted") {
            await updateExtracted(user.id, sample.id, item.pass, item.note);
          } else if (newData.stageLabel == "distributed") {
            await updateDistributed(user.id, sample.id, item.pass, item.note);
          } else if (newData.stageLabel == "analyzed") {
            await updateAnalyzed(user.id, sample.id, item.pass, item.note);
          }
        }),
      );

      return c.json({ message: "Tracking data updated successfully" }, 200);
    } catch (error) {
      console.error("Error save tracking data: ", error);
      return c.json({ error: "Failed to update tracking data" }, 500);
    }
  },
);

tracking.post("/cancel/:lotId", clientRoleMiddleware, async (c) => {
  const user = c.get("user");
  const { lotId } = c.req.param();

  try {
    // Perform the database update
    await canceledLot(user.id, lotId);

    // FIX: Return a success response
    return c.json({ message: "Order canceled successfully" }, 200);
  } catch (error) {
    console.error("Error to cancel order: ", error);
    return c.json({ error: "Failed to cancel order" }, 500);
  }
});
