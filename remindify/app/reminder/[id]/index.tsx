import { useCallback, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { deleteReminder, getReminderById } from "../../../lib/db";
import { cancelReminderNotification } from "../../../lib/notifications";
import { ageTurning, daysLabel, daysUntil, formatDate } from "../../../lib/date";
import { useTranslation } from "../../../lib/i18n";
import { iconFor, labelFor, notifyLabel, relationLabel } from "../../../lib/reminders";
import { Reminder } from "../../../lib/types";
import { styles, theme } from "../../../lib/theme";
import GreetingSheet from "../../../components/GreetingSheet";
import { Avatar, Button, InfoRow, SectionLabel } from "../../../components/ui";

/** Delay before auto-opening the greeting sheet from a notification action. */
const AUTO_GREET_DELAY_MS = 400;

export default function ReminderDetail() {
    const { id, greet } = useLocalSearchParams<{ id: string; greet?: string }>();
    const router = useRouter();
    const t = useTranslation();

    const [reminder, setReminder] = useState<Reminder | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const autoGreeted = useRef(false);

    // Re-reads on focus so edits made on the edit screen show up on return.
    useFocusEffect(
        useCallback(() => {
            if (id) setReminder(getReminderById(id));
        }, [id]),
    );

    // Opened from a notification's "send greeting" action — but only the first time.
    useFocusEffect(
        useCallback(() => {
            if (greet !== "1" || autoGreeted.current) return;
            autoGreeted.current = true;
            const timer = setTimeout(() => setSheetOpen(true), AUTO_GREET_DELAY_MS);
            return () => clearTimeout(timer);
        }, [greet]),
    );

    if (!reminder) return null;
    const r = reminder;
    const days = daysUntil(r.date);

    function confirmDelete() {
        Alert.alert(t.detail.deleteTitle, t.detail.deleteBody, [
            { text: t.common.cancel, style: "cancel" },
            {
                text: t.common.delete,
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
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push({ pathname: "/reminder/[id]/edit", params: { id: r.id } })}
                            hitSlop={12}
                        >
                            <Text style={{ color: theme.accent, fontSize: 16, fontWeight: "600" }}>
                                 {t.common.edit}
                            </Text>
                        </Pressable>
                    ),
                }}
            />

            <Avatar photoUri={r.photoUri} fallback={iconFor(r)} size={150} highlight />

            <Text style={{ color: theme.text, fontSize: 27, fontWeight: "800", letterSpacing: -0.5, marginTop: 20 }}>
                {r.name}
            </Text>
            <Text style={{ color: theme.textDim, fontSize: 15, marginTop: 4 }}>
                {iconFor(r)} {labelFor(r)}
            </Text>

            <Button
                label={t.detail.sendGreeting}
                icon="💬"
                tone={days === 0 ? "accent" : "quiet"}
                onPress={() => setSheetOpen(true)}
                style={{ width: "100%", marginTop: 24 }}
            />

            <View style={[styles.card, { width: "100%", marginTop: 16, padding: 20, gap: 14, borderRadius: 20 }]}>
                <InfoRow label={t.detail.date} value={formatDate(r.date)} />
                <InfoRow label={t.detail.comingUp} value={daysLabel(days)} />
                {r.type === "birthday" && <InfoRow label={t.detail.turning} value={`${ageTurning(r.date)}`} />}
                <InfoRow label={t.detail.reminder} value={notifyLabel(r.notifyDaysBefore)} />
                <InfoRow label={t.detail.relationship} value={relationLabel(r.relation)} />
            </View>

            <View style={{ width: "100%", marginTop: 24 }}>
                <SectionLabel>{t.detail.giftIdeas}</SectionLabel>
                <View style={[styles.card, { padding: 16, minHeight: 80 }]}>
                    <Text
                        style={{
                            color: r.notes ? theme.text : theme.textDim,
                            fontSize: 15,
                            lineHeight: 21,
                            fontStyle: r.notes ? "normal" : "italic",
                        }}
                    >
                        {r.notes || t.detail.noNotes}
                    </Text>
                </View>
            </View>

            <Button
                label={t.detail.deleteAction}
                tone="danger"
                onPress={confirmDelete}
                style={{ width: "100%", marginTop: 28 }}
            />

            <GreetingSheet reminder={r} visible={sheetOpen} onClose={() => setSheetOpen(false)} />
        </ScrollView>
    );
}
