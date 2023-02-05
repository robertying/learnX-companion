import dayjs from "dayjs";
import type { CourseInfo } from "thu-learn-lib-no-native/lib/types";
import {
  dataSource,
  getAndDiffAssignmentsAndGrades,
  getAndDiffFiles,
  getAndDiffNotices,
  getLastSyncTime,
  sendUpdate,
  setLastSyncTime,
} from "./lib/data";
import { getConfig } from "./lib/store";
import { syncInterval } from "./config";

export interface Config {
  username: string;
  password: string;
  lastSyncTime?: Date;
  deviceTokens: string[];
  excludedCourses: string[];
  openAtLogin?: boolean;
}

export const sync = async (config: Config) => {
  const { username, password, excludedCourses, deviceTokens } = config;
  if (!username || !password) {
    throw new Error("Username or password is not set");
  }
  if (!Array.isArray(excludedCourses)) {
    throw new Error("excludedCourses is not an array");
  }
  if (!Array.isArray(deviceTokens)) {
    throw new Error("deviceTokens is not an array");
  }

  try {
    await dataSource.login(username, password);
  } catch (e) {
    console.error("Login failed");
    return;
  }

  let currentSemesterId: string | null = null;
  try {
    const { id } = await dataSource.getCurrentSemester();
    currentSemesterId = id;
  } catch {
    console.error("Get current semester failed");
    return;
  }

  let coursesToSync: CourseInfo[] = [];
  try {
    const courses = await dataSource.getCourseList(currentSemesterId);
    coursesToSync = courses.filter(
      (course) => !excludedCourses.includes(course.id)
    );
  } catch {
    console.error("Get course list failed");
    return;
  }

  const lastSyncTime = await getLastSyncTime();
  const now = dayjs();

  const payload: any = {
    version: 1,
    notices: [],
    assignments: [],
    files: [],
    grades: [],
  };
  await Promise.allSettled([
    (async () => {
      const noticeDiff = await getAndDiffNotices(lastSyncTime, coursesToSync);
      payload.notices = noticeDiff;
    })(),
    (async () => {
      const diff = await getAndDiffAssignmentsAndGrades(
        lastSyncTime,
        coursesToSync
      );
      payload.assignments = diff.assignments;
      payload.grades = diff.grades;
    })(),
    (async () => {
      const diff = await getAndDiffFiles(lastSyncTime, coursesToSync);
      payload.files = diff;
    })(),
  ]);

  sendUpdate(payload);

  await setLastSyncTime(now);
};

let timer: NodeJS.Timer | null = null;

export const start = async () => {
  const config = await getConfig();
  console.log("Sync started");
  sync(config);
  timer = setInterval(() => sync(config), syncInterval);
};

export const stop = () => {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  console.log("Sync stopped");
};
