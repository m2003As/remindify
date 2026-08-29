import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate, parseLocalDate, toDateString } from "../lib/date";
import { useTranslation } from "../lib/i18n";
import { savePhoto } from "../lib/photos";
import {
    DEFAULT_ICON,
    EMOJI_CHOICES,
    isPreset,
    notifyChoices,
    relationChoices,
    typeChoices,
} from "../lib/reminders";
import { Reminder, Relation } from "../lib/types";
import { styles, theme } from "../lib/theme";
import { Avatar, Button, Chip, ChipRow, Input, SectionLabel } from "./ui";

/** Everything about a reminder except its id — what the form produces. */
export type ReminderDraft = Omit<Reminder, "id">;

const DEFAULT_DATE = new Date(2000, 0, 1);
const DEFAULT_NOTIFY_DAYS_BEFORE = 3;
const PICKER_OPTIONS = { quality: 0.6, allowsEditing: true, aspect: [1, 1] as [number, number] };

export default function ReminderForm({
    initial,
    submitLabel,
    onSubmit,
}: {
    /** Prefills the form; omit to start blank. */
    initial?: Reminder;
    submitLabel: string;
    onSubmit: (draft: ReminderDraft) => Promise<void>;
}) {
    const t = useTranslation();
    const startsCustom = !!initial && !isPreset(initial.type);

    const [name, setName] = useState(initial?.name ?? "");
    const [type, setType] = useState(startsCustom ? "birthday" : (initial?.type ?? "birthday"));
    const [customMode, setCustomMode] = useState(startsCustom);
    const [customLabel, setCustomLabel] = useState(startsCustom ? initial!.type : "");
    const [icon, setIcon] = useState(initial?.icon || DEFAULT_ICON);
    const [relation, setRelation] = useState<Relation | null>(initial?.relation ?? null);
    const [date, setDate] = useState(initial ? parseLocalDate(initial.date) : DEFAULT_DATE);
    const [showPicker, setShowPicker] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | null>(initial?.photoUri ?? null);
    const [notifyDaysBefore, setNotifyDaysBefore] = useState(initial?.notifyDaysBefore ?? DEFAULT_NOTIFY_DAYS_BEFORE);
    const [notes, setNotes] = useState(initial?.notes ?? "");
    const [saving, setSaving] = useState(false);

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
        Alert.alert(t.form.addPhoto, undefined, [
            { text: t.form.takePhoto, onPress: () => pickPhoto("camera") },
            { text: t.form.chooseFromLibrary, onPress: () => pickPhoto("library") },
            { text: t.common.cancel, style: "cancel" },
        ]);
    }

    async function submit() {
        if (!name.trim()) return Alert.alert(t.form.nameMissingTitle, t.form.nameMissingBody);
        if (customMode && !customLabel.trim()) return Alert.alert(t.form.typeMissingTitle, t.form.typeMissingBody);

        setSaving(true);
        try {
            await onSubmit({
                name: name.trim(),
                type: customMode ? customLabel.trim() : type,
                icon: customMode ? icon : null,
                relation,
                date: toDateString(date),
                notifyDaysBefore,
                photoUri,
                notes: notes.trim() || null,
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <View style={{ alignItems: "center", marginBottom: 28 }}>
                <Pressable onPress={choosePhotoSource}>
                    <Avatar photoUri={photoUri} fallback="📷" size={120} highlight={!!photoUri} dashed={!photoUri} />
                </Pressable>
                <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 10 }}>{t.form.photoHint}</Text>
            </View>

            <SectionLabel>{t.form.name}</SectionLabel>
            <Input
                placeholder={t.form.namePlaceholder}
                value={name}
                onChangeText={setName}
                style={{ marginBottom: 20 }}
            />

            <SectionLabel>{t.form.type}</SectionLabel>
            <ChipRow
                options={typeChoices()}
                value={customMode ? null : type}
                onChange={(value) => {
                    setType(value);
                    setCustomMode(false);
                }}
                extra={
                    <Chip label={t.form.custom} icon="➕" selected={customMode} onPress={() => setCustomMode(true)} />
                }
            />

            {customMode && (
                <View style={{ marginTop: 12 }}>
                    <Input
                        placeholder={t.form.customPlaceholder}
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

            <SectionLabel style={{ marginTop: 24 }}>{t.form.relationship}</SectionLabel>
            <ChipRow options={relationChoices()} value={relation} onChange={setRelation} />

            <SectionLabel style={{ marginTop: 24 }}>{t.form.date}</SectionLabel>
            <Pressable
                onPress={() => setShowPicker(!showPicker)}
                style={[styles.input, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}
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
                        locale={t.locale}
                        style={{ width: "100%", height: 320, marginTop: 12 }}
                        onChange={(_, selected) => {
                            if (selected instanceof Date) setDate(selected);
                        }}
                    />
                    {Platform.OS === "ios" && (
                        <Button label={t.common.done} onPress={() => setShowPicker(false)} style={{ marginTop: 8 }} />
                    )}
                </>
            )}

            <SectionLabel style={{ marginTop: 24 }}>{t.form.notifyMe}</SectionLabel>
            <ChipRow options={notifyChoices()} value={notifyDaysBefore} onChange={setNotifyDaysBefore} />

            <SectionLabel style={{ marginTop: 24 }}>{t.form.giftIdeas}</SectionLabel>
            <Input
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder={t.form.giftIdeasPlaceholder}
                style={{ minHeight: 90, textAlignVertical: "top" }}
            />

            <Button label={submitLabel} onPress={submit} disabled={saving} style={{ marginTop: 28 }} />
        </ScrollView>
    );
}
