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