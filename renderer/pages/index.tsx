import { useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import {
  Button,
  Checkbox,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import type {
  CourseInfo,
  SemesterInfo,
  UserInfo,
} from "thu-learn-lib-no-native/lib/types";
import { getStoreValue, restartSync, setStoreValue } from "lib/data";

function Home() {
  const [needReLogin, setNeedReLogin] = useState(false);

  const {
    data: userInfoData,
    error: userInfoError,
    isLoading: userInfoLoading,
  } = useSWR<UserInfo>("userInfo", {
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      if (retryCount >= 3) {
        setNeedReLogin(true);
        return;
      }
      setTimeout(() => revalidate({ retryCount }), 3000);
    },
  });

  const {
    data: currentSemesterData,
    error: currentSemesterError,
    isLoading: currentSemesterLoading,
  } = useSWR<SemesterInfo>(userInfoData ? "currentSemester" : null);

  const {
    data: coursesData,
    error: coursesError,
    isLoading: coursesLoading,
  } = useSWR<CourseInfo[]>(
    currentSemesterData ? ["courses", currentSemesterData.id] : null,
    {}
  );

  const [excludedCourses, setExcludedCourses] = useState<string[]>([]);

  const handleCheckBoxClick = (id: string, checked: boolean) => {
    let newExcludedCourses = [];
    if (checked) {
      newExcludedCourses = excludedCourses.filter(
        (courseId) => courseId !== id
      );
    } else {
      newExcludedCourses = [...excludedCourses, id];
    }
    setStoreValue("excludedCourses", newExcludedCourses);
    restartSync();
    setExcludedCourses(newExcludedCourses);
  };

  const handleOpenHelp = () => {
    ipcRenderer.invoke("openExternal", "https://tsinghua.app/learnX-companion");
  };

  useEffect(() => {
    (async () => {
      const excludedCourses = await getStoreValue("excludedCourses", []);
      setExcludedCourses(excludedCourses);
    })();
  }, []);

  useEffect(() => {
    if (userInfoData) {
      setNeedReLogin(false);
    }
  }, [userInfoData]);

  return (
    <Container
      sx={{ py: 4, height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={2}
      >
        <Image src="./logo.png" alt="Logo" width={48} height={48} />
        <Typography component="h1" variant="h4">
          learnX Companion
        </Typography>
      </Stack>
      <Stack sx={{ p: 2 }} spacing={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {userInfoLoading ? (
            <CircularProgress sx={{ mx: "auto" }} />
          ) : userInfoData ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccountCircle />
              <Typography variant="body1">{userInfoData.name}</Typography>
            </Stack>
          ) : (
            <Button
              sx={{ mx: "auto" }}
              variant="contained"
              size="small"
              component={Link}
              href="/settings"
            >
              {userInfoError && needReLogin ? "重新登录" : "登录"}
            </Button>
          )}
          {userInfoData && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button
                variant="contained"
                size="small"
                component={Link}
                href="/settings"
              >
                设置
              </Button>
              <Button size="small" onClick={handleOpenHelp}>
                使用指南
              </Button>
            </Stack>
          )}
        </Stack>
        {userInfoData && (
          <>
            <Stack direction="row" alignItems="center">
              <Typography variant="subtitle2">当前学期：</Typography>
              {currentSemesterLoading ? (
                <CircularProgress size="1rem" />
              ) : (
                <Typography variant="body2">
                  {currentSemesterError
                    ? "获取当前学期失败"
                    : currentSemesterData
                    ? currentSemesterData.id
                    : null}
                </Typography>
              )}
            </Stack>
            {coursesLoading ? (
              <CircularProgress />
            ) : coursesError ? (
              <Typography variant="body1">获取课程失败</Typography>
            ) : coursesData ? (
              <List disablePadding>
                {coursesData.map((course) => (
                  <ListItem
                    key={course.id}
                    disablePadding
                    onClick={() =>
                      handleCheckBoxClick(
                        course.id,
                        excludedCourses.includes(course.id)
                      )
                    }
                  >
                    <ListItemButton role={undefined} dense>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          tabIndex={-1}
                          disableRipple
                          checked={!excludedCourses.includes(course.id)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={course.name}
                        secondary={course.teacherName}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : null}
          </>
        )}
      </Stack>
    </Container>
  );
}

export default Home;
