import { View, Text } from "react-native";
import { bugsnagService } from "../../services/bugsnag";
import { useDynamicRoutes } from "./DynamicRoutesProvider";

interface DynamicRouteRendererProps {
  path: string;
}

export function DynamicRouteRenderer({
  path,
}: DynamicRouteRendererProps): JSX.Element {
  const { getRouteComponent } = useDynamicRoutes();

  try {
    const Component = getRouteComponent(path);

    if (!Component) {
      bugsnagService.leaveBreadcrumb("Route not found", { path });
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Route nicht gefunden: {path}</Text>
        </View>
      );
    }

    return <Component />;
  } catch (error: unknown) {
    bugsnagService.notify(
      error instanceof Error
        ? error
        : new Error(`Error rendering dynamic route: ${path}`)
    );

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>
          Fehler beim Rendern der Route: {path}
        </Text>
      </View>
    );
  }
}
