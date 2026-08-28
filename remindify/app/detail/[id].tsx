import { View, Text, Image, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getReminderById, deleteReminder } from "../../lib/db";
import { cancelReminderNotification } from "../../lib/notifications";
import { Reminder } from "../../lib/types";
import { daysUntilNext, daysLabel, formatDateDisplay, ageTurning, typeIcon, typeLabel } from "../../lib/dateUtils";

export default function Detail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [reminder, setReminder] = useState<Reminder | null>(null);

    useEffect(() => {
        if (id) setReminder(getReminderById(id));
    }, [id]);

    if (!reminder) return null;
    const currentReminder = reminder;
    const days = daysUntilNext(currentReminder.date);

    async function handleDelete() {
        Alert.alert("Slette?", "Er du sikker på at du vil slette denne?", [
            { text: "Avbryt", style: "cancel" },
            {
                text: "Slett", style: "destructive", onPress: async () => {
                    await cancelReminderNotification(currentReminder.id);
                    deleteReminder(currentReminder.id);
                    router.back();
                },
            },
        ]);
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#121212", padding: 24, alignItems: "center" }}>
            {currentReminder.photoUri ? (
                <Image source={{ uri: currentReminder.photoUri }} style={{ width: 160, height: 160, borderRadius: 80, marginTop: 20, marginBottom: 20, borderWidth: 3, borderColor: "#f2a900" }} />
            ) : (
                <View style={{ width: 160, height: 160, borderRadius: 80, marginTop: 20, marginBottom: 20, backgroundColor: "#1e1e1e", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 56 }}>{typeIcon[currentReminder.type]}</Text>
                </View>
            )}

            <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800" }}>{currentReminder.name}</Text>
            <Text style={{ color: "#888", fontSize: 15, marginTop: 4 }}>{typeIcon[currentReminder.type]} {typeLabel[currentReminder.type]}</Text>

            <View style={{ backgroundColor: "#1a1a1a", borderRadius: 20, padding: 20, width: "100%", marginTop: 28, gap: 14 }}>
                <Row label="Dato" value={formatDateDisplay(currentReminder.date)} />
                <Row label="Om" value={daysLabel(days)} />
                {currentReminder.type === "birthday" && <Row label="Fyller" value={`${ageTurning(currentReminder.date)} år`} />}
            </View>

            <Pressable onPress={handleDelete} style={{ padding: 16, backgroundColor: "#3a1a1a", borderRadius: 16, width: "100%", marginTop: 30 }}>
                <Text style={{ color: "#e05c5c", textAlign: "center", fontWeight: "700" }}>Slett minne</Text>
            </Pressable>
        </View>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#888", fontSize: 14 }}>{label}</Text>
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{value}</Text>
        </View>
    );
}