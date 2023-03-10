import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../store";
import { refreshToken } from "../utils/auth";
import Layout from "../components/layout";
import { IBM_Plex_Sans } from "@next/font/google";
import Loading from "../components/loading";
import { configure } from "axios-hooks";
import axios from "axios";
import { useRouter } from "next/router";

axios.interceptors.request.use(
  async (config) => {
    const token = useAppStore.getState().accessToken;

    if (token) {
      config.headers = {
        authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

configure({ defaultOptions: { manual: true, autoCancel: true } });

const roboto = IBM_Plex_Sans({
  weight: ["300", "600", "700"],
  subsets: ["latin"],
});
export default function App({ Component, pageProps }: AppProps) {
  const { appLoading, setAccessToken, setUser, accessToken } = useAppStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const isAppLoading = useMemo(() => {
    return loading || appLoading;
  }, [appLoading, loading]);

  useEffect(() => {
    //initial funciton
    refreshToken().then((data) => {
      if (data.ok) {
        setAccessToken(data.accessToken);
        setUser(data.user);
      }

      setLoading(false);
    });
  }, [setAccessToken, setUser]);

  useEffect(() => {
    //starts silent refreshes
    let interval: NodeJS.Timer;

    if (accessToken) {
      interval = setInterval(() => {
        refreshToken().then((data) => {
          if (data.ok) {
            setAccessToken(data.accessToken);
            setUser(data.user);
          }
        });
      }, 600000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [accessToken, setAccessToken, setUser]);

  useEffect(() => {
    if (accessToken) {
      if (!router.pathname.includes("dashboard")) {
        router.push("/dashboard");
      }
    }
  }, [accessToken, router]);

  return (
    <>
      <Loading loading={appLoading} />
      <Layout className={roboto.className}>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
