import { Image, Pressable, Text, View } from "react-native";
import { Reminder } from "../lib/types";
import { useRouter } from "expo-router";
import { daysUntilNext, daysLabel, typeIcon } from "../lib/dateUtils";

export default function ReminderCard({ reminder }: { reminder: Reminder }) {
    const router = useRouter();
    const days = daysUntilNext(reminder.date);
    const isSoon = days <= 7;

    return (
        <Pressable
            onPress={() => router.push(`/detail/${reminder.id}`)}
            style={{
                flexDirection: "row", alignItems: "center", padding: 14,
                borderRadius: 20, backgroundColor: "#1a1a1a", marginBottom: 12,
                borderWidth: 1, borderColor: "#242424",
            }}
        >
            {reminder.photoUri ? (
                <Image source={{ uri: reminder.photoUri }} style={{ width: 56, height: 56, borderRadius: 28, marginRight: 14 }} />
            ) : (
                <View style={{
                    width: 56, height: 56, borderRadius: 28, marginRight: 14,
                    backgroundColor: "#2a2a2a", alignItems: "center", justifyContent: "center",
                }}>
                    <Text style={{ fontSize: 22 }}>{typeIcon[reminder.type]}</Text>
                </View>
            )}
            <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{reminder.name}</Text>
                <Text style={{ color: "#888", fontSize: 13, marginTop: 2 }}>{typeIcon[reminder.type]} {daysLabel(days)}</Text>
            </View>
            {isSoon && (
                <View style={{ backgroundColor: "#f2a90022", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                    <Text style={{ color: "#f2a900", fontSize: 12, fontWeight: "700" }}>Snart</Text>
                </View>
            )}
        </Pressable>
    );
}