import { ipcRenderer } from "electron";
import { forwardRef, useEffect, useState } from "react";
import {
  AppBar,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close, Delete, Visibility, VisibilityOff } from "@mui/icons-material";
import type { TransitionProps } from "@mui/material/transitions";
import { useRouter } from "next/router";
import { getStoreValue, restartSync, setStoreValue } from "lib/data";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Settings() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deviceTokens, setDeviceTokens] = useState<string[]>([]);
  const [deviceAddDialogOpen, setDeviceAddDialogOpen] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [deviceToRemove, setDeviceToRemove] = useState<string | null>(null);
  const [openAtLogin, setOpenAtLogin] = useState(true);
  const [version, setVersion] = useState("");

  const handleClose = () => {
    router.push("/");
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleDeviceAdd = () => {
    if (!newToken) {
      return;
    }
    const newDeviceTokens = [...deviceTokens, newToken];
    setDeviceTokens(newDeviceTokens);
    handleDeviceAddDialogClose();
  };

  const handleDeviceAddDialogOpen = () => {
    setDeviceAddDialogOpen(true);
  };

  const handleDeviceAddDialogClose = () => {
    setNewToken("");
    setDeviceAddDialogOpen(false);
  };

  const handleDeviceRemoveDialogClose = () => {
    setDeviceToRemove(null);
  };

  const handleDeviceRemove = () => {
    const newDeviceTokens = deviceTokens.filter(
      (token) => token !== deviceToRemove
    );
    setDeviceTokens(newDeviceTokens);
    setDeviceToRemove(null);
  };

  const handleSave = async () => {
    await Promise.allSettled([
      setStoreValue("username", username),
      setStoreValue("password", password),
      setStoreValue("deviceTokens", deviceTokens),
      ipcRenderer.invoke("setOpenAtLogin", openAtLogin),
    ]);
    await restartSync();
    handleClose();
  };

  const handleOpenConfig = () => {
    ipcRenderer.invoke("openConfigFile");
  };

  const handleOpenAtLogin = () => {
    setOpenAtLogin(!openAtLogin);
  };

  const handleCheckUpdates = () => {
    ipcRenderer.invoke("checkForUpdates");
  };

  useEffect(() => {
    (async () => {
      const username = await getStoreValue("username", "");
      const password = await getStoreValue("password", "");
      const deviceTokens = await getStoreValue("deviceTokens", []);
      const openAtLogin = await getStoreValue("openAtLogin", true);
      const version = await ipcRenderer.invoke("getVersion");
      setUsername(username);
      setPassword(password);
      setDeviceTokens(deviceTokens);
      setOpenAtLogin(openAtLogin);
      setVersion(version);
    })();
  }, []);

  return (
    <Dialog
      fullScreen
      open
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }} color="primary">
        <Toolbar>
          <IconButton
            sx={{ ml: 0 }}
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            设置
          </Typography>
          <Button color="inherit" onClick={handleSave}>
            保存
          </Button>
        </Toolbar>
      </AppBar>
      <Typography variant="h6" component="h2" sx={{ ml: 2, mt: 2 }}>
        登录信息
      </Typography>
      <List>
        <ListItem>
          <TextField
            required
            margin="none"
            label="用户名 / 学号"
            type="username"
            spellCheck={false}
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
          />
        </ListItem>
        <ListItem>
          <FormControl fullWidth variant="outlined" required margin="none">
            <InputLabel htmlFor="outlined-adornment-password">密码</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              label="密码"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </ListItem>
      </List>
      <Divider sx={{ mb: 2 }} />
      <Stack
        sx={{ px: 2, pb: 1 }}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h6" component="h2">
          设备标识符
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={handleDeviceAddDialogOpen}
        >
          添加设备
        </Button>
      </Stack>
      <List dense sx={{ px: 2 }}>
        {deviceTokens.map((token) => (
          <ListItem
            key={token}
            secondaryAction={
              <IconButton edge="end" onClick={() => setDeviceToRemove(token)}>
                <Delete />
              </IconButton>
            }
          >
            <ListItemText primary={token} />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" component="h2" sx={{ ml: 2, mt: 2 }}>
        高级
      </Typography>
      <List dense>
        <ListItem>
          <ListItemButton onClick={handleOpenAtLogin}>
            <ListItemText primary="开机自启" />
            <ListItemIcon sx={{ minWidth: "unset" }}>
              <Checkbox
                edge="end"
                tabIndex={-1}
                disableRipple
                checked={openAtLogin}
              />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={handleOpenConfig}>
            <ListItemText primary="定位配置文件" secondary="用于命令行程序" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={handleCheckUpdates}>
            <ListItemText primary="版本" secondary={version} />
          </ListItemButton>
        </ListItem>
      </List>
      <Dialog open={deviceAddDialogOpen} onClose={handleDeviceAddDialogClose}>
        <DialogTitle>添加设备</DialogTitle>
        <DialogContent>
          <DialogContentText>
            请输入 learnX 推送通知界面显示的设备标识符。
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="设备标识符"
            required
            fullWidth
            variant="standard"
            type="text"
            spellCheck={false}
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeviceAddDialogClose}>取消</Button>
          <Button onClick={handleDeviceAdd}>确定</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deviceToRemove ? true : false}
        onClose={handleDeviceRemoveDialogClose}
      >
        <DialogTitle>移除此设备？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            此设备将不再接收来自 learnX Companion 的推送通知。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeviceRemoveDialogClose}>取消</Button>
          <Button onClick={handleDeviceRemove}>确定</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

export default Settings;
