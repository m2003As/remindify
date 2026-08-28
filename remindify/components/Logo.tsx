import { View, Text } from "react-native";
import { theme } from "../lib/theme";

export function LogoMark({ size = 34 }: { size?: number }) {
    return (
        <View
            style={{
                width: size, height: size, borderRadius: size * 0.32,
                backgroundColor: theme.accent,
                alignItems: "center", justifyContent: "center",
                shadowColor: theme.accent, shadowOpacity: 0.45,
                shadowRadius: size * 0.4, shadowOffset: { width: 0, height: size * 0.12 },
                elevation: 8,
            }}
        >
            <View style={{
                width: size * 0.58, height: size * 0.58, borderRadius: size * 0.29,
                borderWidth: size * 0.075, borderColor: theme.bg,
                alignItems: "center", justifyContent: "center",
            }}>
                <View style={{
                    width: size * 0.16, height: size * 0.16,
                    borderRadius: size * 0.08, backgroundColor: theme.bg,
                }} />
            </View>
        </View>
    );
}

export function Logo({ size = 34 }: { size?: number }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: size * 0.3 }}>
            <LogoMark size={size} />
            <Text style={{ fontSize: size * 0.82, fontWeight: "800", letterSpacing: -0.5 }}>
                <Text style={{ color: theme.accent }}>ri</Text>
                <Text style={{ color: theme.text }}>Mind</Text>
            </Text>
        </View>
    );
}