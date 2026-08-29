import { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { findBirthdays, candidateToReminder, Candidate } from "../lib/contactsImport";
import { addReminder } from "../lib/db";
import { requestNotificationPermission, scheduleForReminder } from "../lib/notifications";
import { formatDateDisplay } from "../lib/dateUtils";
import { theme } from "../lib/theme";

export default function ImportContacts() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        findBirthdays()
            .then((list) => {
                setCandidates(list);
                setSelected(new Set(list.map((c) => c.key)));
            })
            .catch((e) => Alert.alert("Kunne ikke lese kontakter", e.message))
            .finally(() => setLoading(false));
    }, []);

    function toggle(key: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }

    async function importSelected() {
        setSaving(true);
        const chosen = candidates.filter((c) => selected.has(c.key));
        const granted = await requestNotificationPermission();

        for (let i = 0; i < chosen.length; i++) {
            const reminder = await candidateToReminder(chosen[i], i);
            addReminder(reminder);
            if (granted) await scheduleForReminder(reminder);
        }

        setSaving(false);
        Alert.alert("Ferdig", `${chosen.length} bursdager lagt til.`, [
            { text: "OK", onPress: () => router.back() },
        ]);
    }

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator color={theme.accent} />
                <Text style={{ color: theme.textDim, marginTop: 14 }}>Leser kontakter…</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: "600", padding: 20, paddingBottom: 8 }}>
                {candidates.length === 0
                    ? "Fant ingen bursdager i kontaktene dine"
                    : `Fant ${candidates.length} bursdager`}
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
                            style={{
                                flexDirection: "row", alignItems: "center", gap: 14,
                                padding: 14, borderRadius: 16, marginBottom: 10,
                                backgroundColor: theme.surface,
                                borderWidth: 1, borderColor: on ? theme.accent : theme.border,
                            }}
                        >
                            {item.photoUri ? (
                                <Image source={{ uri: item.photoUri }} style={{ width: 42, height: 42, borderRadius: 21 }} />
                            ) : (
                                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ fontSize: 18 }}>🎂</Text>
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: theme.text, fontWeight: "700", fontSize: 15 }}>{item.name}</Text>
                                <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 2 }}>
                                    {formatDateDisplay(item.date)}
                                </Text>
                            </View>
                            <View style={{
                                width: 24, height: 24, borderRadius: 12,
                                borderWidth: 2, borderColor: on ? theme.accent : theme.border,
                                backgroundColor: on ? theme.accent : "transparent",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                {on && <Text style={{ color: theme.bg, fontSize: 13, fontWeight: "900" }}>✓</Text>}
                            </View>
                        </Pressable>
                    );
                }}
            />

            {candidates.length > 0 && (
                <View style={{ position: "absolute", left: 20, right: 20, bottom: 34 }}>
                    <Pressable
                        onPress={importSelected}
                        disabled={saving || selected.size === 0}
                        style={{
                            backgroundColor: selected.size === 0 ? theme.surfaceAlt : theme.accent,
                            padding: 18, borderRadius: 18, alignItems: "center",
                        }}
                    >
                        <Text style={{ color: selected.size === 0 ? theme.textDim : theme.bg, fontWeight: "800", fontSize: 15 }}>
                            {saving ? "Legger til…" : `Legg til ${selected.size}`}
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}