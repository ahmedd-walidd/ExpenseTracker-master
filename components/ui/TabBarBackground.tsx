import React from "react";
import { Platform, View } from "react-native";

/**
 * A simple tab bar background component.
 * On iOS, you could use BlurView for a translucent effect.
 * On Android/web, it renders a plain background.
 */
export default function TabBarBackground() {
  if (Platform.OS === "ios") {
    // Use a semi-transparent background on iOS for a native feel
    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.85)",
        }}
      />
    );
  }

  // On Android/web, use a solid background
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#ffffff",
      }}
    />
  );
}
