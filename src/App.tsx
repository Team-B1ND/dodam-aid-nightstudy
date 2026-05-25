import { BridgeProvider } from "@b1nd/aid-kit/bridge-kit/web";
import { SafeAreaProvider } from "@b1nd/aid-kit/safe-area-provider";
import { AppStateProvider } from "@b1nd/aid-kit/app-state";
import { RouteProvider, Router } from "@b1nd/aid-kit/navigation";
import NightStudyPage from "./pages";


const routes = {
  tabs: [
    { path: "/", index: true, element: NightStudyPage }
  ],
  stacks: []
};

const App = () => (
  <BridgeProvider>
    <SafeAreaProvider>
      <AppStateProvider>
        <RouteProvider routes={routes}>
          <Router routes={routes} />
        </RouteProvider>
      </AppStateProvider>
    </SafeAreaProvider>
  </BridgeProvider>
);

export default App