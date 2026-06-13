import { BridgeProvider } from "@b1nd/aid-kit/bridge-kit/web";
import { SafeAreaProvider } from "@b1nd/aid-kit/safe-area-provider";
import { AppStateProvider, useAppState } from "@b1nd/aid-kit/app-state";
import { RouteProvider, Router } from "@b1nd/aid-kit/navigation";
import { useBridgeProvider } from "@b1nd/aid-kit/bridge-kit/web";
import NightStudyPage from "./pages";
import { useEffect } from "react";

const routes = {
    tabs: [
        { path: "/", index: true, element: NightStudyPage }
    ],
    stacks: []
};

const ThemeApplier = () => {
    const [theme] = useAppState<"light" | "dark">("dark", "theme");
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    return null;
};

const TokenInitializer = () => {
    const bridge = useBridgeProvider();

    useEffect(() => {
        const unsubscribe = bridge.subscribe("OAUTH_GET_TOKEN", async (data) => {
            // 화면에 데이터 표시
            document.title = JSON.stringify(data);
            const div = document.createElement('div');
            div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;font-size:12px;z-index:9999;word-break:break-all;padding:8px;';
            div.textContent = 'Bridge 응답: ' + JSON.stringify(data);
            document.body.appendChild(div);

            const response = data as { accessToken: string };
            if (response.accessToken) {
                localStorage.setItem("access_token", response.accessToken);
                window.location.reload();
            }
            return {};
        });

        bridge.send("OAUTH_GET_TOKEN");

        return () => unsubscribe();
    }, []);

    return null;
};

const App = () => (
    <BridgeProvider>
        <SafeAreaProvider>
            <AppStateProvider>
                <ThemeApplier />
                <TokenInitializer />
                <RouteProvider routes={routes}>
                    <Router routes={routes} />
                </RouteProvider>
            </AppStateProvider>
        </SafeAreaProvider>
    </BridgeProvider>
);

export default App;