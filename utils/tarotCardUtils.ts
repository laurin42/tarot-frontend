import { ISelectedAndShownCard } from "@/constants/tarotcards";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveDrawnCards(cards: ISelectedAndShownCard[]): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.warn("No user token found, skipping save to database");
        resolve();
        return;
      }

      await Promise.all(
        cards.map(async (card, index) => {
          try {
            const headers = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            };

            const saveResponse = await fetch(
              `${
                process.env.EXPO_PUBLIC_API_URL || "http://192.168.178.67:8000"
              }/tarot/drawn-card`,
              {
                method: "POST",
                headers,
                body: JSON.stringify({
                  name: card.name,
                  description: card.explanation,
                  position: index,
                }),
              }
            );

            if (saveResponse.ok) {
              console.log(`✅ Card saved to user history: ${card.name}`);
            } else {
              console.error(
                `❌ Failed to save card: ${card.name}`,
                await saveResponse.text()
              );
            }
          } catch (saveError) {
            console.error("Failed to save card:", saveError);
          }
        })
      );

      console.log("✅ All drawn cards saved to database");
      resolve();
    } catch (error) {
      console.error("Failed to save drawn cards:", error);
      reject(error);
    }
  });
}