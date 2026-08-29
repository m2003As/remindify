import { View, Text, Image, Pressable, Alert, TextInput, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getReminderById, deleteReminder, updateReminder } from "../../lib/db";
import { cancelReminderNotification, scheduleForReminder } from "../../lib/notifications";
import { Reminder } from "../../lib/types";
import { daysUntilNext, daysLabel, formatDateDisplay, ageTurning, iconFor, labelFor, notifyLabel } from "../../lib/dateUtils";
import { greetingFor, greetingWithAge, sendGreeting } from "../../lib/greetings";
import { theme } from "../../lib/theme";
import NotifyPills from "../../components/NotifyPills";

export default function Detail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [reminder, setReminder] = useState<Reminder | null>(null);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!id) return;
        const r = getReminderById(id);
        setReminder(r);
        setNotes(r?.notes ?? "");
    }, [id]);

    if (!reminder) return null;
    const r = reminder;
    const days = daysUntilNext(r.date);
    const isToday = days === 0;

    function saveNotes() {
        const updated = { ...r, notes: notes.trim() || null };
        updateReminder(updated);
        setReminder(updated);
    }

    async function changeNotify(value: number) {
        const updated = { ...r, notifyDaysBefore: value };
        updateReminder(updated);
        setReminder(updated);
        await scheduleForReminder(updated);
    }

    function handleGreet() {
        if (r.type === "birthday") {
            Alert.alert("Send hilsen", undefined, [
                { text: greetingWithAge(r), onPress: () => sendGreeting(greetingWithAge(r)) },
                { text: greetingFor(r), onPress: () => sendGreeting(greetingFor(r)) },
                { text: "Avbryt", style: "cancel" },
            ]);
        } else {
            sendGreeting(greetingFor(r));
        }
    }

    function handleDelete() {
        Alert.alert("Slette?", "Er du sikker på at du vil slette denne?", [
            { text: "Avbryt", style: "cancel" },
            {
                text: "Slett", style: "destructive", onPress: async () => {
                    await cancelReminderNotification(r.id);
                    deleteReminder(r.id);
                    router.back();
                },
            },
        ]);
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 24, paddingBottom: 60, alignItems: "center" }}>
            {r.photoUri ? (
                <Image source={{ uri: r.photoUri }} style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 20, borderWidth: 3, borderColor: theme.accent }} />
            ) : (
                <View style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 20, backgroundColor: theme.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 56 }}>{iconFor(r)}</Text>
                </View>
            )}

            <Text style={{ color: theme.text, fontSize: 27, fontWeight: "800", letterSpacing: -0.5 }}>{r.name}</Text>
            <Text style={{ color: theme.textDim, fontSize: 15, marginTop: 4 }}>
                {iconFor(r)} {labelFor(r)}
            </Text>

            <Pressable
                onPress={handleGreet}
                style={({ pressed }) => ({
                    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                    backgroundColor: isToday ? theme.accent : theme.surfaceAlt,
                    borderWidth: 1, borderColor: isToday ? theme.accent : theme.border,
                    padding: 16, borderRadius: 16, width: "100%", marginTop: 24,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
            >
                <Text style={{ fontSize: 17 }}>💬</Text>
                <Text style={{ color: isToday ? theme.bg : theme.text, fontWeight: "700", fontSize: 15 }}>
                    Send hilsen
                </Text>
            </Pressable>

            <View style={{ backgroundColor: theme.surface, borderRadius: 20, padding: 20, width: "100%", marginTop: 16, gap: 14, borderWidth: 1, borderColor: theme.border }}>
                <Row label="Dato" value={formatDateDisplay(r.date)} />
                <Row label="Om" value={daysLabel(days)} />
                {r.type === "birthday" && <Row label="Fyller" value={`${ageTurning(r.date)} år`} />}
                <Row label="Varsel" value={notifyLabel(r.notifyDaysBefore)} />
            </View>

            <View style={{ width: "100%", marginTop: 24 }}>
                <Text style={styles.sectionLabel}>Varsle meg</Text>
                <NotifyPills value={r.notifyDaysBefore} onChange={changeNotify} />
            </View>

            <View style={{ width: "100%", marginTop: 24 }}>
                <Text style={styles.sectionLabel}>Gaveideer</Text>
                <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    onBlur={saveNotes}
                    multiline
                    placeholder="Noe hun nevnte i mars…"
                    placeholderTextColor="#5A5A६6"
                    style={{
                        backgroundColor: theme.surface, color: theme.text, padding: 16,
                        borderRadius: 16, fontSize: 15, minHeight: 100, textAlignVertical: "top",
                        borderWidth: 1, borderColor: theme.border,
                    }}
                />
            </View>

            <Pressable onPress={handleDelete} style={{ padding: 16, backgroundColor: theme.dangerSoft, borderRadius: 16, width: "100%", marginTop: 28 }}>
                <Text style={{ color: theme.danger, textAlign: "center", fontWeight: "700" }}>Slett minne</Text>
            </Pressable>
        </ScrollView>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: theme.textDim, fontSize: 14 }}>{label}</Text>
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: "600" }}>{value}</Text>
        </View>
    );
}

const styles = {
    sectionLabel: {
        color: theme.textDim, fontSize: 12, fontWeight: "700",
        marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8,
    } as const,
};