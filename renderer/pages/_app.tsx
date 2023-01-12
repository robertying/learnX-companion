import "styles/index.css";
import { useMemo } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useMediaQuery, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { SWRConfig } from "swr";
import getAppTheme from "styles/theme";
import { fetcher } from "lib/data";

export default function App({ Component, pageProps }: AppProps) {
  const darkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(() => getAppTheme(darkMode), [darkMode]);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1"
        />
        <meta
          httpEquiv="Content-Security-Policy"
          content={`default-src 'self' 'unsafe-inline'${
            process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"
          }; connect-src 'self' https://id.tsinghua.edu.cn https://learn.tsinghua.edu.cn`}
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SWRConfig
          value={{
            fetcher,
          }}
        >
          <Component {...pageProps} />
        </SWRConfig>
      </ThemeProvider>
    </>
  );
}
