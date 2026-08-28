import { useState } from "react";
import {
    View, TextInput, Text, Pressable, Image, Alert,
    ScrollView, Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { addReminder } from "../lib/db";
import { requestNotificationPermission, scheduleYearlyReminder } from "../lib/notifications";
import { Reminder } from "../lib/types";
import {
    formatDateDisplay, toLocalDateString,
    PRESET_TYPES, EMOJI_CHOICES,
} from "../lib/dateUtils";

export default function AddReminder() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [type, setType] = useState("birthday");
    const [icon, setIcon] = useState("⭐");
    const [customLabel, setCustomLabel] = useState("");
    const [customMode, setCustomMode] = useState(false);
    const [date, setDate] = useState(new Date(2000, 0, 1));
    const [showPicker, setShowPicker] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    async function persistPhoto(tempUri: string) {
        const filename = tempUri.split("/").pop();
        const dest = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.copyAsync({ from: tempUri, to: dest });
        return dest;
    }

    async function pickFromCamera() {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
        const result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true, aspect: [1, 1] });
        if (!result.canceled) setPhotoUri(await persistPhoto(result.assets[0].uri));
    }

    async function pickFromLibrary() {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true, aspect: [1, 1] });
        if (!result.canceled) setPhotoUri(await persistPhoto(result.assets[0].uri));
    }

    async function save() {
        if (!name.trim()) {
            Alert.alert("Navn mangler", "Skriv inn et navn før du lagrer.");
            return;
        }
        if (customMode && !customLabel.trim()) {
            Alert.alert("Type mangler", "Gi den egendefinerte typen et navn.");
            return;
        }

        const reminder: Reminder = {
            id: Date.now().toString(),
            name: name.trim(),
            type: customMode ? customLabel.trim() : type,
            icon: customMode ? icon : null,
            date: toLocalDateString(date),
            notifyDaysBefore: 0,
            photoUri,
        };
        addReminder(reminder);

        const granted = await requestNotificationPermission();
        if (granted) await scheduleYearlyReminder(reminder);

        router.back();
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            {/* Bilde */}
            <View style={{ alignItems: "center", marginBottom: 28 }}>
                <Pressable
                    onPress={() =>
                        Alert.alert("Legg til bilde", undefined, [
                            { text: "Ta bilde", onPress: pickFromCamera },
                            { text: "Velg fra album", onPress: pickFromLibrary },
                            { text: "Avbryt", style: "cancel" },
                        ])
                    }
                >
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.avatarLarge} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={{ fontSize: 32 }}>📷</Text>
                        </View>
                    )}
                </Pressable>
                <Text style={styles.photoHint}>Trykk for å legge til bilde</Text>
            </View>

            {/* Navn */}
            <Text style={styles.label}>Navn</Text>
            <TextInput
                placeholder="F.eks. Mamma"
                placeholderTextColor="#6b6b6b"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />

            {/* Type */}
            <Text style={styles.label}>Type</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                {PRESET_TYPES.map((p) => {
                    const active = !customMode && type === p.type;
                    return (
                        <Pressable
                            key={p.type}
                            onPress={() => { setType(p.type); setCustomMode(false); }}
                            style={[styles.pill, active && styles.pillActive]}
                        >
                            <Text style={{ fontSize: 16 }}>{p.icon}</Text>
                            <Text style={[styles.pillText, active && styles.pillTextActive]}>{p.label}</Text>
                        </Pressable>
                    );
                })}
                <Pressable
                    onPress={() => setCustomMode(true)}
                    style={[styles.pill, customMode && styles.pillActive]}
                >
                    <Text style={{ fontSize: 16 }}>➕</Text>
                    <Text style={[styles.pillText, customMode && styles.pillTextActive]}>Egen</Text>
                </Pressable>
            </View>

            {customMode && (
                <View style={{ marginBottom: 20 }}>
                    <TextInput
                        placeholder="F.eks. Eksamen, Flyttedag, Førerkort"
                        placeholderTextColor="#6b6b6b"
                        value={customLabel}
                        onChangeText={setCustomLabel}
                        style={[styles.input, { marginBottom: 12 }]}
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {EMOJI_CHOICES.map((e) => (
                            <Pressable
                                key={e}
                                onPress={() => setIcon(e)}
                                style={[styles.emojiTile, icon === e && styles.emojiTileActive]}
                            >
                                <Text style={{ fontSize: 22 }}>{e}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Dato */}
            <Text style={styles.label}>Dato</Text>
            <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
                <Text style={styles.dateButtonText}>{formatDateDisplay(toLocalDateString(date))}</Text>
                <Text style={{ fontSize: 16 }}>📅</Text>
            </Pressable>

            {showPicker && (
                <View style={{ marginBottom: 12 }}>
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="inline"
                        themeVariant="dark"
                        locale="nb-NO"
                        style={{ width: "100%", height: 320 }}
                        onChange={(event, selectedDate) => {
                            if (selectedDate instanceof Date) setDate(selectedDate);
                        }}
                    />
                </View>
            )}

            {showPicker && Platform.OS === "ios" && (
                <Pressable style={styles.doneButton} onPress={() => setShowPicker(false)}>
                    <Text style={{ fontWeight: "600", color: "#121212" }}>Ferdig</Text>
                </Pressable>
            )}

            {/* Lagre */}
            <Pressable onPress={save} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Lagre minne</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = {
    container: { flex: 1, backgroundColor: "#121212" } as const,
    avatarLarge: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: "#f2a900" } as const,
    avatarPlaceholder: {
        width: 120, height: 120, borderRadius: 60, backgroundColor: "#1e1e1e",
        alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#2a2a2a", borderStyle: "dashed",
    } as const,
    photoHint: { color: "#888", fontSize: 13, marginTop: 10 } as const,
    label: { color: "#aaa", fontSize: 13, fontWeight: "600", marginBottom: 8, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 } as const,
    input: {
        backgroundColor: "#1e1e1e", color: "#fff", padding: 16, borderRadius: 14,
        fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: "#2a2a2a",
    } as const,
    pill: {
        flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 14,
        borderRadius: 20, backgroundColor: "#1e1e1e", borderWidth: 1, borderColor: "#2a2a2a",
    } as const,
    pillActive: { backgroundColor: "#f2a90022", borderColor: "#f2a900" } as const,
    pillText: { color: "#aaa", fontSize: 13, fontWeight: "600" } as const,
    pillTextActive: { color: "#f2a900" } as const,
    emojiTile: {
        width: 48, height: 48, borderRadius: 14, marginRight: 8,
        alignItems: "center", justifyContent: "center",
        backgroundColor: "#1e1e1e", borderWidth: 1, borderColor: "#2a2a2a",
    } as const,
    emojiTileActive: { backgroundColor: "#f2a90022", borderColor: "#f2a900" } as const,
    dateButton: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        backgroundColor: "#1e1e1e", padding: 16, borderRadius: 14, marginBottom: 12,
        borderWidth: 1, borderColor: "#2a2a2a",
    } as const,
    dateButtonText: { color: "#fff", fontSize: 16 } as const,
    doneButton: {
        backgroundColor: "#f2a900", padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 20,
    } as const,
    saveButton: { backgroundColor: "#f2a900", padding: 18, borderRadius: 16, alignItems: "center", marginTop: 20 } as const,
    saveButtonText: { color: "#121212", fontWeight: "700", fontSize: 16 } as const,
};