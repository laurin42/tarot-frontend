import { Redirect } from "expo-router";

export default function TabIndex() {
  // Leitet vom Root der Tabs ("/") zum ersten gewünschten Tab weiter
  return <Redirect href="/threeCards" />;
}
