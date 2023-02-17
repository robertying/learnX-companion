import dayjs, { Dayjs } from "dayjs";
import axios, { AxiosError } from "axios";
import { Learn2018Helper } from "thu-learn-lib-no-native";
import type {
  CourseInfo,
  File,
  Homework,
  Notification,
} from "thu-learn-lib-no-native/lib/types";
import { setStoreValue, getStoreValue } from "./store";
import {
  generateAssignmentDiff,
  generateFileDiff,
  generateGradeDiff,
  generateNoticeDiff,
} from "./diff";

export const dataSource = new Learn2018Helper();

export const getLastSyncTime = async () => {
  return dayjs((await getStoreValue("lastSyncTime", new Date())) as Date);
};

export const setLastSyncTime = async (time: Dayjs) => {
  await setStoreValue("lastSyncTime", time.toDate());
};

export const login = async () => {
  const username = (await getStoreValue("username")) as string | undefined;
  const password = (await getStoreValue("password")) as string | undefined;
  if (!username || !password) {
    throw new Error("No username or password");
  }

  await dataSource.login(username, password);
};

export const getAndDiffNotices = async (
  lastSyncTime: Dayjs,
  courses: CourseInfo[]
) => {
  const results = await Promise.allSettled(
    courses.map(async (course) => {
      const data = await dataSource.getNotificationList(course.id);
      const notices = data
        .map((notice) => ({
          ...notice,
          courseId: course.id,
          courseName: course.name,
          courseEnglishName: course.englishName,
          courseTeacherName: course.teacherName,
        }))
        .sort(
          (a, b) => dayjs(b.publishTime).unix() - dayjs(a.publishTime).unix()
        );
      const diff = generateNoticeDiff(lastSyncTime, notices);
      return diff;
    })
  );

  let noticeDiff: Notification[] = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      noticeDiff = [...noticeDiff, ...result.value];
    }
  });
  return noticeDiff;
};

export const getAndDiffAssignmentsAndGrades = async (
  lastSyncTime: Dayjs,
  courses: CourseInfo[]
) => {
  const results = await Promise.allSettled(
    courses.map(async (course) => {
      const data = await dataSource.getHomeworkList(course.id);
      const assignments = data
        .map((assignment) => ({
          ...assignment,
          courseId: course.id,
          courseName: course.name,
          courseEnglishName: course.englishName,
          courseTeacherName: course.teacherName,
        }))
        .sort(
          (a, b) => dayjs(b.publishTime).unix() - dayjs(a.publishTime).unix()
        );
      return {
        assignments: generateAssignmentDiff(lastSyncTime, assignments),
        grades: generateGradeDiff(lastSyncTime, assignments),
      };
    })
  );

  let assignmentDiff: Homework[] = [];
  let gradeDiff: Homework[] = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      assignmentDiff = [...assignmentDiff, ...result.value.assignments];
      gradeDiff = [...gradeDiff, ...result.value.grades];
    }
  });

  return {
    assignments: assignmentDiff,
    grades: gradeDiff,
  };
};

export const getAndDiffFiles = async (
  lastSyncTime: Dayjs,
  courses: CourseInfo[]
) => {
  const results = await Promise.allSettled(
    courses.map(async (course) => {
      const data = await dataSource.getFileList(course.id);
      const files = data
        .map((file) => ({
          ...file,
          courseId: course.id,
          courseName: course.name,
          courseEnglishName: course.englishName,
          courseTeacherName: course.teacherName,
        }))
        .sort(
          (a, b) => dayjs(b.uploadTime).unix() - dayjs(a.uploadTime).unix()
        );
      const diff = generateFileDiff(lastSyncTime, files);
      return diff;
    })
  );

  let fileDiff: File[] = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      fileDiff = [...fileDiff, ...result.value];
    }
  });
  return fileDiff;
};

export const sendUpdate = async (payload: any) => {
  console.log(new Date(), payload);

  if (
    payload.notices.length === 0 &&
    payload.assignments.length === 0 &&
    payload.grades.length === 0 &&
    payload.files.length === 0
  ) {
    return;
  }

  const deviceTokens = (await getStoreValue("deviceTokens", [])) as string[];
  if (deviceTokens.length === 0) {
    return;
  }

  try {
    await axios.post("https://tsinghua.app/api/pushnotifications", {
      payload,
      tokens: deviceTokens,
    });
  } catch (e) {
    throw new Error("Send update failed", (e as AxiosError).toJSON());
  }
};
