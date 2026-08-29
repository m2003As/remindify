import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { addReminder } from "../../lib/db";
import { savePhoto } from "../../lib/photos";
import { requestNotificationPermission, scheduleForReminder } from "../../lib/notifications";
import { formatDate, toDateString } from "../../lib/date";
import {
    DEFAULT_ICON,
    EMOJI_CHOICES,
    NOTIFY_OPTIONS,
    RELATIONS,
    REMINDER_TYPES,
} from "../../lib/reminders";
import { Reminder, Relation } from "../../lib/types";
import { styles, theme } from "../../lib/theme";
import { Avatar, Button, Chip, ChipRow, Input, SectionLabel } from "../../components/ui";

const DEFAULT_DATE = new Date(2000, 0, 1);
const DEFAULT_NOTIFY_DAYS_BEFORE = 3;
const PICKER_OPTIONS = { quality: 0.6, allowsEditing: true, aspect: [1, 1] as [number, number] };

export default function NewReminder() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [type, setType] = useState("birthday");
    const [customLabel, setCustomLabel] = useState("");
    const [customMode, setCustomMode] = useState(false);
    const [icon, setIcon] = useState(DEFAULT_ICON);
    const [relation, setRelation] = useState<Relation | null>(null);
    const [date, setDate] = useState(DEFAULT_DATE);
    const [showPicker, setShowPicker] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [notifyDaysBefore, setNotifyDaysBefore] = useState(DEFAULT_NOTIFY_DAYS_BEFORE);
    const [notes, setNotes] = useState("");

    async function pickPhoto(source: "camera" | "library") {
        const fromCamera = source === "camera";
        const permission = fromCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = fromCamera
            ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
            : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
        if (result.canceled) return;

        setPhotoUri(await savePhoto(result.assets[0].uri));
    }

    function choosePhotoSource() {
        Alert.alert("Add a photo", undefined, [
            { text: "Take a photo", onPress: () => pickPhoto("camera") },
            { text: "Choose from library", onPress: () => pickPhoto("library") },
            { text: "Cancel", style: "cancel" },
        ]);
    }

    async function save() {
        if (!name.trim()) return Alert.alert("Name missing", "Enter a name before saving.");
        if (customMode && !customLabel.trim()) return Alert.alert("Type missing", "Give your custom type a name.");

        const reminder: Reminder = {
            id: Date.now().toString(),
            name: name.trim(),
            type: customMode ? customLabel.trim() : type,
            icon: customMode ? icon : null,
            relation,
            date: toDateString(date),
            notifyDaysBefore,
            photoUri,
            notes: notes.trim() || null,
        };

        addReminder(reminder);
        if (await requestNotificationPermission()) await scheduleForReminder(reminder);

        router.back();
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <View style={{ alignItems: "center", marginBottom: 28 }}>
                <Pressable onPress={choosePhotoSource}>
                    <Avatar photoUri={photoUri} fallback="📷" size={120} highlight={!!photoUri} dashed={!photoUri} />
                </Pressable>
                <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 10 }}>Tap to add a photo</Text>
            </View>

            <SectionLabel>Name</SectionLabel>
            <Input placeholder="e.g. Mum" value={name} onChangeText={setName} style={{ marginBottom: 20 }} />

            <SectionLabel>Type</SectionLabel>
            <ChipRow
                options={REMINDER_TYPES}
                value={customMode ? null : type}
                onChange={(value) => {
                    setType(value);
                    setCustomMode(false);
                }}
                extra={<Chip label="Custom" icon="➕" selected={customMode} onPress={() => setCustomMode(true)} />}
            />

            {customMode && (
                <View style={{ marginTop: 12 }}>
                    <Input
                        placeholder="e.g. Exam, Moving day, Driving test"
                        value={customLabel}
                        onChangeText={setCustomLabel}
                        style={{ marginBottom: 12 }}
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {EMOJI_CHOICES.map((emoji) => (
                            <Pressable
                                key={emoji}
                                onPress={() => setIcon(emoji)}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 14,
                                    marginRight: 8,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: icon === emoji ? theme.accentSoft : theme.surfaceAlt,
                                    borderWidth: 1,
                                    borderColor: icon === emoji ? theme.accent : theme.border,
                                }}
                            >
                                <Text style={{ fontSize: 22 }}>{emoji}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}

            <SectionLabel style={{ marginTop: 24 }}>Relationship (optional)</SectionLabel>
            <ChipRow options={RELATIONS} value={relation} onChange={setRelation} />

            <SectionLabel style={{ marginTop: 24 }}>Date</SectionLabel>
            <Pressable
                onPress={() => setShowPicker(!showPicker)}
                style={[
                    styles.input,
                    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
                ]}
            >
                <Text style={{ color: theme.text, fontSize: 16 }}>{formatDate(toDateString(date))}</Text>
                <Text style={{ fontSize: 16 }}>📅</Text>
            </Pressable>

            {showPicker && (
                <>
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="inline"
                        themeVariant="dark"
                        style={{ width: "100%", height: 320, marginTop: 12 }}
                        onChange={(_, selected) => {
                            if (selected instanceof Date) setDate(selected);
                        }}
                    />
                    {Platform.OS === "ios" && (
                        <Button label="Done" onPress={() => setShowPicker(false)} style={{ marginTop: 8 }} />
                    )}
                </>
            )}

            <SectionLabel style={{ marginTop: 24 }}>Notify me</SectionLabel>
            <ChipRow options={NOTIFY_OPTIONS} value={notifyDaysBefore} onChange={setNotifyDaysBefore} />

            <SectionLabel style={{ marginTop: 24 }}>Gift ideas (optional)</SectionLabel>
            <Input
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Has been wanting…"
                style={{ minHeight: 90, textAlignVertical: "top" }}
            />

            <Button label="Save reminder" onPress={save} style={{ marginTop: 28 }} />
        </ScrollView>
    );
}
