import { Component, type ReactNode } from "react";
import { BridgeProvider } from "@b1nd/aid-kit/bridge-kit/web";
import { SafeAreaProvider } from "@b1nd/aid-kit/safe-area-provider";
import { AppStateProvider, useAppState } from "@b1nd/aid-kit/app-state";
import { RouteProvider, Router } from "@b1nd/aid-kit/navigation";
import NightStudyPage from "./pages";
import { useEffect } from "react";

const routes = {
    tabs: [
        { path: "/", index: true, element: NightStudyPage }
    ],
    stacks: []
};

class ErrorBoundary extends Component
{ children: ReactNode },
{ error: Error | null }
> {
    state = { error: null as Error | null };

static getDerivedStateFromError(error: Error) {
        return { error };
    }

    render() {
        if (this.state.error) {
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
                    {String(this.state.error?.stack ?? this.state.error?.message ?? this.state.error)}
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
                    <RouteProvider routes={routes}>
                        <Router routes={routes} />
                    </RouteProvider>
                </AppStateProvider>
            </SafeAreaProvider>
        </BridgeProvider>
    </ErrorBoundary>
);

export default App;