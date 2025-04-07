import "react-native-gesture-handler";
import { ExpoRoot } from "expo-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <ExpoRoot context={require.context(".", true, /^\.\/app(_|\/).*$/)} />
    </ErrorBoundary>
  );
}

export default App;
