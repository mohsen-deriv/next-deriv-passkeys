import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useAppStore } from "../store";
import { refreshToken } from "../utils/auth";
import Layout from "../components/layout";
import { IBM_Plex_Sans } from "@next/font/google";
import { RingSpinner, RouletteSpinner } from "react-spinner-overlay";
import Loading from "../components/loading";
import { configure } from "axios-hooks";

configure({ defaultOptions: { manual: true, autoCancel: true } });

const roboto = IBM_Plex_Sans({
  weight: ["300", "600", "700"],
  subsets: ["latin"],
});
export default function App({ Component, pageProps }: AppProps) {
  const { setAccessToken, setUser, accessToken } = useAppStore();

  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <Loading loading={loading} />
      <Layout className={roboto.className}>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
