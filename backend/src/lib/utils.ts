import { SampleListType } from "@/db/query/sample.query";
import { Member } from "@/types";

export const StatusClassify = (
  receivedCheck: boolean | null,
  extractedCheck: boolean | null,
  runDistCheck: boolean | null,
  predictedCheck: boolean | null,
) => {
  if (!predictedCheck) {
    if (runDistCheck) {
      return "distributed";
    } else {
      if (extractedCheck) {
        return "extracted";
      } else {
        if (receivedCheck) {
          return "delivered";
        } else {
          return "shipped";
        }
      }
    }
  } else {
    return "analyzed";
  }
};

export const TrackingStatus = (
  SampleList: SampleListType,
  OrderUser: Member,
  ReceiveUser: Member | null,
  ExtractUser: Member | null,
  RunDistUser: Member | null,
  PredictUser: Member | null,
) => {
  const StatusComplete = (user: Member | null) => {
    return user !== null ? "completed" : "pending";
  };

  const LastStatus = StatusClassify(
    SampleList.some((sample) => sample.receivedCheck === true),
    SampleList.some((sample) => sample.extractedCheck === true),
    SampleList.some((sample) => sample.distRunCheck === true),
    SampleList.some((sample) => sample.predictedCheck === true),
  );

  return {
    currentStatus: LastStatus,
    lastUpdate: SampleList[0].updatedAt,
    history: [
      {
        status: StatusComplete(OrderUser),
        label: "shipped",
        date: SampleList[0].orderedAt,
        location: OrderUser.name,
        qc: {
          updatedBy: OrderUser.userName,
          pass: SampleList.every((item) => item.orderedAt !== null),
          sample: SampleList.map((item) => {
            return {
              code: item.biobankCode,
              note: item.orderedNote,
              pass: true,
              updatedAt: item.orderedAt,
            };
          }),
        },
      },
      {
        status: StatusComplete(ReceiveUser),
        label: "delivered",
        date: SampleList[0].receivedAt,
        location: ReceiveUser?.name,
        qc: {
          updatedBy: ReceiveUser?.userName,
          pass: SampleList.every((item) => item.receivedCheck),
          sample: SampleList.map((item) => {
            return {
              code: item.biobankCode,
              note: item.receivedNote,
              pass: item.receivedCheck,
              updatedAt: item.receivedAt,
            };
          }),
        },
      },
      {
        status: StatusComplete(ExtractUser),
        label: "extracted",
        date: SampleList[0].extractedAt,
        location: ExtractUser?.name,
        qc: {
          updatedBy: ExtractUser?.userName,
          pass: SampleList.every((item) => item.extractedCheck),
          sample: SampleList.map((item) => {
            return {
              code: item.biobankCode,
              note: item.extractedNote,
              pass: item.extractedCheck,
              updatedAt: item.extractedAt,
            };
          }),
        },
      },
      {
        status: StatusComplete(RunDistUser),
        label: "distributed",
        date: SampleList[0].distRunAt,
        location: RunDistUser?.name,
        qc: {
          updatedBy: RunDistUser?.userName,
          pass: SampleList.every((item) => item.distRunCheck),
          sample: SampleList.map((item) => {
            return {
              code: item.biobankCode,
              note: item.distRunNote,
              pass: item.distRunCheck,
              updatedAt: item.distRunAt,
            };
          }),
        },
      },
      {
        status: StatusComplete(PredictUser),
        label: "analyzed",
        date: SampleList[0].predictedAt,
        location: PredictUser?.name,
        qc: {
          updatedBy: PredictUser?.userName,
          pass: SampleList.every((item) => item.predictedCheck),
          sample: SampleList.map((item) => {
            return {
              code: item.biobankCode,
              note: item.predictedNote,
              pass: item.predictedCheck,
              updatedAt: item.predictedAt,
            };
          }),
        },
      },
    ],
  };
};
