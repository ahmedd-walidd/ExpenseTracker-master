import {
    Feather,
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

/**
 * Mapping from SF Symbols-style icon names to @expo/vector-icons equivalents.
 * Each entry maps to a specific icon library and glyph name.
 */
const ICON_MAP: Record<
  string,
  | { library: "Ionicons"; name: React.ComponentProps<typeof Ionicons>["name"] }
  | {
      library: "MaterialCommunityIcons";
      name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    }
  | {
      library: "FontAwesome";
      name: React.ComponentProps<typeof FontAwesome>["name"];
    }
  | { library: "Feather"; name: React.ComponentProps<typeof Feather>["name"] }
> = {
  // Chevrons
  "chevron.right": { library: "Ionicons", name: "chevron-forward" },
  "chevron.down": { library: "Ionicons", name: "chevron-down" },
  "chevron.up": { library: "Ionicons", name: "chevron-up" },

  // Actions
  plus: { library: "Ionicons", name: "add" },
  trash: { library: "Ionicons", name: "trash-outline" },
  xmark: { library: "Ionicons", name: "close" },

  // Arrows
  "arrow.down.circle.fill": { library: "Ionicons", name: "arrow-down-circle" },
  "arrow.down.circle": {
    library: "Ionicons",
    name: "arrow-down-circle-outline",
  },
  "arrow.up.circle.fill": { library: "Ionicons", name: "arrow-up-circle" },
  "arrow.up.circle": { library: "Ionicons", name: "arrow-up-circle-outline" },
  "arrow.clockwise": { library: "Ionicons", name: "refresh" },

  // Currency / Finance
  "dollarsign.circle.fill": { library: "FontAwesome", name: "dollar" },
  "dollarsign.circle": { library: "FontAwesome", name: "dollar" },
  "equal.circle.fill": { library: "MaterialCommunityIcons", name: "equal-box" },

  // Calendar & Time
  calendar: { library: "Ionicons", name: "calendar-outline" },
  clock: { library: "Ionicons", name: "time-outline" },

  // Documents & Text
  "doc.text": { library: "Ionicons", name: "document-text-outline" },
  "text.quote": {
    library: "MaterialCommunityIcons",
    name: "format-quote-close",
  },

  // People & Auth
  "person.badge.plus": { library: "Ionicons", name: "person-add-outline" },
  "envelope.badge": { library: "Ionicons", name: "mail-outline" },

  // Misc
  sparkles: { library: "Ionicons", name: "sparkles" },
  bell: { library: "Ionicons", name: "notifications-outline" },
  gear: { library: "Ionicons", name: "settings-outline" },
  "info.circle": { library: "Ionicons", name: "information-circle-outline" },
  "list.bullet": { library: "Ionicons", name: "list" },
  "checkmark.circle.fill": { library: "Ionicons", name: "checkmark-circle" },

  // Sort-related
  "calendar.badge.clock": { library: "Ionicons", name: "calendar" },
  banknote: { library: "MaterialCommunityIcons", name: "cash" },
};

// All SF Symbol-style names used in the project
export type IconSymbolName = keyof typeof ICON_MAP;

export interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color?: string;
  weight?:
    | "ultraLight"
    | "thin"
    | "light"
    | "regular"
    | "medium"
    | "semibold"
    | "bold"
    | "heavy"
    | "black";
  style?: StyleProp<ViewStyle>;
}

/**
 * A cross-platform icon component that maps SF Symbols-style names
 * to @expo/vector-icons glyphs. Falls back to a question mark icon
 * for unmapped names.
 */
export function IconSymbol({
  name,
  size = 24,
  color = "#000",
  style,
}: IconSymbolProps) {
  const mapping = ICON_MAP[name];

  if (!mapping) {
    // Fallback for unmapped icon names
    return (
      <Ionicons
        name="help-circle-outline"
        size={size}
        color={color}
        style={style as any}
      />
    );
  }

  switch (mapping.library) {
    case "Ionicons":
      return (
        <Ionicons
          name={mapping.name}
          size={size}
          color={color}
          style={style as any}
        />
      );
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons
          name={mapping.name}
          size={size}
          color={color}
          style={style as any}
        />
      );
    case "FontAwesome":
      return (
        <FontAwesome
          name={mapping.name}
          size={size}
          color={color}
          style={style as any}
        />
      );
    case "Feather":
      return (
        <Feather
          name={mapping.name}
          size={size}
          color={color}
          style={style as any}
        />
      );
    default:
      return (
        <Ionicons
          name="help-circle-outline"
          size={size}
          color={color}
          style={style as any}
        />
      );
  }
}
