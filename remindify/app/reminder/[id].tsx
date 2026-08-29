import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { deleteReminder, getReminderById, updateReminder } from "../../lib/db";
import { cancelReminderNotification, scheduleForReminder } from "../../lib/notifications";
import { ageTurning, daysLabel, daysUntil, formatDate } from "../../lib/date";
import { iconFor, labelFor, NOTIFY_OPTIONS, notifyLabel, RELATIONS } from "../../lib/reminders";
import { Reminder, Relation } from "../../lib/types";
import { styles, theme } from "../../lib/theme";
import GreetingSheet from "../../components/GreetingSheet";
import { Avatar, Button, ChipRow, InfoRow, Input, SectionLabel } from "../../components/ui";

/** Delay before auto-opening the greeting sheet from a notification action. */
const AUTO_GREET_DELAY_MS = 400;

export default function ReminderDetail() {
    const { id, greet } = useLocalSearchParams<{ id: string; greet?: string }>();
    const router = useRouter();

    const [reminder, setReminder] = useState<Reminder | null>(null);
    const [notes, setNotes] = useState("");
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        const found = getReminderById(id);
        setReminder(found);
        setNotes(found?.notes ?? "");
    }, [id]);

    useEffect(() => {
        if (greet !== "1" || !reminder) return;
        const timer = setTimeout(() => setSheetOpen(true), AUTO_GREET_DELAY_MS);
        return () => clearTimeout(timer);
    }, [greet, reminder]);

    if (!reminder) return null;
    const r = reminder;
    const days = daysUntil(r.date);

    /** Persists a change and reschedules notifications when the timing changed. */
    async function patch(changes: Partial<Reminder>, reschedule = false) {
        const updated = { ...r, ...changes };
        updateReminder(updated);
        setReminder(updated);
        if (reschedule) await scheduleForReminder(updated);
    }

    function confirmDelete() {
        Alert.alert("Delete this reminder?", "This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await cancelReminderNotification(r.id);
                    deleteReminder(r.id);
                    router.back();
                },
            },
        ]);
    }

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={{ padding: 24, paddingBottom: 60, alignItems: "center" }}
        >
            <Avatar photoUri={r.photoUri} fallback={iconFor(r)} size={150} highlight />

            <Text style={{ color: theme.text, fontSize: 27, fontWeight: "800", letterSpacing: -0.5, marginTop: 20 }}>
                {r.name}
            </Text>
            <Text style={{ color: theme.textDim, fontSize: 15, marginTop: 4 }}>
                {iconFor(r)} {labelFor(r)}
            </Text>

            <Button
                label="Send greeting"
                icon="💬"
                tone={days === 0 ? "accent" : "quiet"}
                onPress={() => setSheetOpen(true)}
                style={{ width: "100%", marginTop: 24 }}
            />

            <View style={[styles.card, { width: "100%", marginTop: 16, padding: 20, gap: 14, borderRadius: 20 }]}>
                <InfoRow label="Date" value={formatDate(r.date)} />
                <InfoRow label="Coming up" value={daysLabel(days)} />
                {r.type === "birthday" && <InfoRow label="Turning" value={`${ageTurning(r.date)}`} />}
                <InfoRow label="Reminder" value={notifyLabel(r.notifyDaysBefore)} />
            </View>

            <View style={{ width: "100%", marginTop: 24 }}>
                <SectionLabel>Relationship</SectionLabel>
                <ChipRow
                    options={RELATIONS}
                    value={r.relation}
                    onChange={(relation: Relation) => patch({ relation })}
                />
            </View>

            <View style={{ width: "100%", marginTop: 24 }}>
                <SectionLabel>Notify me</SectionLabel>
                <ChipRow
                    options={NOTIFY_OPTIONS}
                    value={r.notifyDaysBefore}
                    onChange={(notifyDaysBefore: number) => patch({ notifyDaysBefore }, true)}
                />
            </View>

            <View style={{ width: "100%", marginTop: 24 }}>
                <SectionLabel>Gift ideas</SectionLabel>
                <Input
                    value={notes}
                    onChangeText={setNotes}
                    onBlur={() => patch({ notes: notes.trim() || null })}
                    multiline
                    placeholder="Something they mentioned in March…"
                    style={{ minHeight: 100, textAlignVertical: "top", backgroundColor: theme.surface }}
                />
            </View>

            <Button
                label="Delete reminder"
                tone="danger"
                onPress={confirmDelete}
                style={{ width: "100%", marginTop: 28 }}
            />

            <GreetingSheet reminder={r} visible={sheetOpen} onClose={() => setSheetOpen(false)} />
        </ScrollView>
    );
}
