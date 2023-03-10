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

  const handleOpenLog = () => {
    ipcRenderer.invoke("openLogFile");
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
            ??????
          </Typography>
          <Button color="inherit" onClick={handleSave}>
            ??????
          </Button>
        </Toolbar>
      </AppBar>
      <Typography variant="h6" component="h2" sx={{ ml: 2, mt: 2 }}>
        ????????????
      </Typography>
      <List>
        <ListItem>
          <TextField
            required
            margin="none"
            label="????????? / ??????"
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
            <InputLabel htmlFor="outlined-adornment-password">??????</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              label="??????"
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
          ???????????????
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={handleDeviceAddDialogOpen}
        >
          ????????????
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
        ??????
      </Typography>
      <List dense>
        <ListItem>
          <ListItemButton onClick={handleOpenAtLogin}>
            <ListItemText primary="????????????" />
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
            <ListItemText primary="??????????????????" secondary="?????????????????????" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={handleOpenLog}>
            <ListItemText primary="??????????????????" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={handleCheckUpdates}>
            <ListItemText primary="??????" secondary={version} />
          </ListItemButton>
        </ListItem>
      </List>
      <Dialog open={deviceAddDialogOpen} onClose={handleDeviceAddDialogClose}>
        <DialogTitle>????????????</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ????????? learnX ?????????????????????????????????????????????
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="???????????????"
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
          <Button onClick={handleDeviceAddDialogClose}>??????</Button>
          <Button onClick={handleDeviceAdd}>??????</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deviceToRemove ? true : false}
        onClose={handleDeviceRemoveDialogClose}
      >
        <DialogTitle>??????????????????</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ?????????????????????????????? learnX Companion ??????????????????
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeviceRemoveDialogClose}>??????</Button>
          <Button onClick={handleDeviceRemove}>??????</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

export default Settings;
