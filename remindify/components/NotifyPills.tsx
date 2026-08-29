import { View, Text, Pressable } from "react-native";
import { NOTIFY_OPTIONS } from "../lib/dateUtils";
import { theme } from "../lib/theme";

export default function NotifyPills({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {NOTIFY_OPTIONS.map((o) => {
                const active = value === o.value;
                return (
                    <Pressable
                        key={o.value}
                        onPress={() => onChange(o.value)}
                        style={{
                            paddingVertical: 9, paddingHorizontal: 14, borderRadius: 20,
                            backgroundColor: active ? theme.accentSoft : theme.surfaceAlt,
                            borderWidth: 1, borderColor: active ? theme.accent : theme.border,
                        }}
                    >
                        <Text style={{ color: active ? theme.accent : theme.textDim, fontSize: 13, fontWeight: "600" }}>
                            {o.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}