import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BirthdayCandidate, candidateToReminder, findBirthdays } from "../../lib/contacts";
import { addReminder } from "../../lib/db";
import { requestNotificationPermission, scheduleForReminder } from "../../lib/notifications";
import { formatDate } from "../../lib/date";
import { styles, theme } from "../../lib/theme";
import { Avatar, Button } from "../../components/ui";

export default function ImportBirthdays() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [candidates, setCandidates] = useState<BirthdayCandidate[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        findBirthdays()
            .then((found) => {
                setCandidates(found);
                setSelected(new Set(found.map((c) => c.key)));
            })
            .catch((e) => Alert.alert("Could not read contacts", e.message))
            .finally(() => setLoading(false));
    }, []);

    function toggle(key: string) {
        setSelected((previous) => {
            const next = new Set(previous);
            if (!next.delete(key)) next.add(key);
            return next;
        });
    }

    async function importSelected() {
        setSaving(true);
        const chosen = candidates.filter((c) => selected.has(c.key));
        const notify = await requestNotificationPermission();

        for (const [index, candidate] of chosen.entries()) {
            const reminder = await candidateToReminder(candidate, index);
            addReminder(reminder);
            if (notify) await scheduleForReminder(reminder);
        }

        setSaving(false);
        Alert.alert("Done", `${chosen.length} birthdays added.`, [{ text: "OK", onPress: () => router.back() }]);
    }

    if (loading) {
        return (
            <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
                <ActivityIndicator color={theme.accent} />
                <Text style={{ color: theme.textDim, marginTop: 14 }}>Reading contacts…</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: "600", padding: 20, paddingBottom: 8 }}>
                {candidates.length === 0
                    ? "No birthdays found in your contacts"
                    : `Found ${candidates.length} birthdays`}
            </Text>

            <FlatList
                data={candidates}
                keyExtractor={(c) => c.key}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
                renderItem={({ item }) => {
                    const on = selected.has(item.key);
                    return (
                        <Pressable
                            onPress={() => toggle(item.key)}
                            style={[
                                styles.card,
                                {
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 14,
                                    padding: 14,
                                    marginBottom: 10,
                                    borderColor: on ? theme.accent : theme.border,
                                },
                            ]}
                        >
                            <Avatar photoUri={item.photoUri} fallback="🎂" size={42} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: theme.text, fontWeight: "700", fontSize: 15 }}>{item.name}</Text>
                                <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 2 }}>
                                    {formatDate(item.date)}
                                </Text>
                            </View>
                            <View
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: on ? theme.accent : theme.border,
                                    backgroundColor: on ? theme.accent : "transparent",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {on && <Text style={{ color: theme.bg, fontSize: 13, fontWeight: "900" }}>✓</Text>}
                            </View>
                        </Pressable>
                    );
                }}
            />

            {candidates.length > 0 && (
                <View style={{ position: "absolute", left: 20, right: 20, bottom: 34 }}>
                    <Button
                        label={saving ? "Adding…" : `Add ${selected.size}`}
                        onPress={importSelected}
                        disabled={saving || selected.size === 0}
                    />
                </View>
            )}
        </View>
    );
}
