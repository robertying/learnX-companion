import dayjs, { Dayjs } from "dayjs";
import type {
  File,
  Homework,
  Notification,
} from "thu-learn-lib-no-native/lib/types";

export const generateNoticeDiff = (
  lastSyncTime: Dayjs,
  newData: Notification[]
) => {
  const diff = newData.filter((item) => {
    return dayjs.tz(item.publishTime).isAfter(lastSyncTime);
  });
  return diff;
};

export const generateAssignmentDiff = (
  lastSyncTime: Dayjs,
  newData: Homework[]
) => {
  const diff = newData.filter((item) => {
    return dayjs(item.publishTime).isAfter(lastSyncTime);
  });
  return diff;
};

export const generateFileDiff = (lastSyncTime: Dayjs, newData: File[]) => {
  const diff = newData.filter((item) => {
    return dayjs.tz(item.uploadTime).isAfter(lastSyncTime);
  });
  return diff;
};

export const generateGradeDiff = (lastSyncTime: Dayjs, newData: Homework[]) => {
  const diff = newData.filter((item) => {
    return item.gradeTime && dayjs(item.gradeTime).isAfter(lastSyncTime);
  });
  return diff;
};
