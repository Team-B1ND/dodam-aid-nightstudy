import { Component, useEffect, type ReactNode } from "react";
import { BridgeProvider } from "@b1nd/aid-kit/bridge-kit/web";
import { SafeAreaProvider } from "@b1nd/aid-kit/safe-area-provider";
import { AppStateProvider, useAppState } from "@b1nd/aid-kit/app-state";
import { RouteProvider, Router } from "@b1nd/aid-kit/navigation";
import NightStudyPage from "./pages";
import { AccessTokenBridge } from "./components/AccessTokenBridge";

const routes = {
    tabs: [
        { path: "/", index: true, element: NightStudyPage }
    ],
    stacks: []
};

type EBProps = { children: ReactNode };
type EBState = { error: Error | null };

class ErrorBoundary extends Component<EBProps, EBState> {
    state: EBState = { error: null };

    static getDerivedStateFromError(error: Error): EBState {
        return { error };
    }

    render() {
        const { error } = this.state;
        if (error) {
            return (
                <pre
                    style={{
                        padding: 16,
                        fontSize: 12,
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                    }}
                >
                    {String(error.stack ?? error.message ?? error)}
                </pre>
            );
        }
        return this.props.children;
    }
}

const ThemeApplier = () => {
    const [theme] = useAppState<"light" | "dark">("dark", "theme");
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    return null;
};

const App = () => (
    <ErrorBoundary>
        <BridgeProvider>
            <SafeAreaProvider>
                <AppStateProvider>
                    <ThemeApplier />
                    <AccessTokenBridge />
                    <RouteProvider routes={routes}>
                        <Router routes={routes} />
                    </RouteProvider>
                </AppStateProvider>
            </SafeAreaProvider>
        </BridgeProvider>
    </ErrorBoundary>
);

export default App;