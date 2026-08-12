import { Component, useEffect, type ReactNode } from "react";
import { BridgeProvider } from "@b1nd/aid-kit/bridge-kit/web";
import { SafeAreaProvider } from "@b1nd/aid-kit/safe-area-provider";
import { AppStateProvider } from "@b1nd/aid-kit/app-state";
import { RouteProvider, Router } from "@b1nd/aid-kit/navigation";
import { AccessTokenBridge } from "./components/AccessTokenBridge";
import { PROJECT_DETAIL_PATH, TAB_PATHS } from "./routes";
import NormalNightStudyPage from "./pages/normalNightStudy";
import ProjectNightStudyPage from "./pages/projectNightStudy";
import ProjectDetailPage from "./pages/projectNightStudy/detail";
import AttendanceCheckPage from "./pages/attendance";
import MemberLookupPage from "./pages/members";

const routes = {
    tabs: [
        { path: TAB_PATHS.normal, index: true, element: NormalNightStudyPage },
        { path: TAB_PATHS.project, element: ProjectNightStudyPage },
        { path: TAB_PATHS.members, element: MemberLookupPage },
        { path: TAB_PATHS.attendance, element: AttendanceCheckPage },
    ],
    stacks: [
        { path: PROJECT_DETAIL_PATH, element: ProjectDetailPage },
    ]
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

/** 기기(휴대폰) 테마를 따라 라이트/다크를 전환한다 */
const ThemeApplier = () => {
    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");

        const apply = () => {
            document.documentElement.setAttribute(
                "data-theme",
                media.matches ? "dark" : "light"
            );
        };

        apply();
        // 앱을 켜둔 채로 기기 설정을 바꿔도 바로 따라가게 한다
        media.addEventListener("change", apply);

        return () => media.removeEventListener("change", apply);
    }, []);

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