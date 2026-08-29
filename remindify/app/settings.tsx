import { useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { exportBackup, importBackup } from "../lib/backup";
import { theme } from "../lib/theme";

export default function Settings() {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function handleExport() {
        setBusy(true);
        try {
            await exportBackup();
        } catch (e: any) {
            Alert.alert("Kunne ikke eksportere", e.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleImport() {
        setBusy(true);
        try {
            const n = await importBackup();
            if (n > 0) Alert.alert("Import fullført", `${n} minner gjenopprettet.`);
        } catch (e: any) {
            Alert.alert("Kunne ikke importere", e.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg, padding: 20 }}>
            <Text style={label}>Kontakter</Text>
            <Item icon="👥" title="Importer bursdager" sub="Hent bursdager fra kontaktlisten" onPress={() => router.push("/import-contacts")} />

            <Text style={[label, { marginTop: 28 }]}>Sikkerhetskopi</Text>
            <Item icon="⬆️" title="Eksporter backup" sub="Lagre alle minner som JSON-fil" onPress={handleExport} />
            <Item icon="⬇️" title="Importer backup" sub="Gjenopprett fra en tidligere fil" onPress={handleImport} />

            {busy && <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />}

            <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 28, lineHeight: 18 }}>
                Bilder følger ikke med i sikkerhetskopien — de ligger lokalt på telefonen.
            </Text>
        </View>
    );
}

function Item({ icon, title, sub, onPress }: { icon: string; title: string; sub: string; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                flexDirection: "row", alignItems: "center", gap: 14,
                backgroundColor: theme.surface, padding: 16, borderRadius: 16,
                marginBottom: 10, borderWidth: 1, borderColor: theme.border,
                opacity: pressed ? 0.7 : 1,
            })}
        >
            <Text style={{ fontSize: 20 }}>{icon}</Text>
            <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: "700", fontSize: 15 }}>{title}</Text>
                <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 2 }}>{sub}</Text>
            </View>
            <Text style={{ color: theme.textDim, fontSize: 18 }}>›</Text>
        </Pressable>
    );
}

const label = {
    color: theme.textDim, fontSize: 12, fontWeight: "700",
    marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8,
} as const;