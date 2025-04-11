import { Tabs } from "expo-router";
import React from "react";
import { Platform, SafeAreaView } from "react-native";
import { colors } from "@/styles/theme";
import DailyCardIcon from "../../components/icons/DailyCardIcon";
import ThreeCardsIcon from "../../components/icons/ThreeCardsIcon";
import ProfileIcon from "../../components/icons/ProfileIcon";

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.tabBarBackground }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          headerShown: false,
          tabBarStyle: {
            height: 65,
            paddingBottom: 0,
            paddingTop: 0,
            backgroundColor: colors.tabBarBackground,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            ...Platform.select({
              android: {
                elevation: 0,
              },
              ios: {
                shadowColor: "transparent",
                shadowOpacity: 0,
                shadowRadius: 0,
                shadowOffset: {
                  height: 0,
                  width: 0,
                },
              },
            }),
          },
          tabBarLabelPosition: "below-icon",
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            marginTop: 2,
            paddingBottom: 4,
          },
          tabBarIconStyle: {
            marginTop: 6,
          },
        }}
        initialRouteName="threecards"
        safeAreaInsets={{ bottom: 0, top: 0, left: 0, right: 0 }}
      >
        <Tabs.Screen
          name="threecards"
          options={{
            title: "threecards",
            tabBarIcon: ({ color }) => (
              <ThreeCardsIcon width={28} height={28} fill={color} />
            ),
            tabBarLabel: "Drei Karten",
          }}
        />
        <Tabs.Screen
          name="dailyCard"
          options={{
            title: "Tageskarte",
            tabBarIcon: ({ color }) => (
              <DailyCardIcon width={28} height={28} fill={color} />
            ),
            tabBarLabel: "Tageskarte",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ color }) => (
              <ProfileIcon width={28} height={28} fill={color} />
            ),
            tabBarLabel: "Profil",
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
