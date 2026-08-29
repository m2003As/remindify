import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Reminder } from "../lib/types";
import { buildGreetings, greetingCount, sendGreeting, SUGGESTIONS_PER_PAGE } from "../lib/greetings";
import { useTranslation } from "../lib/i18n";
import { theme } from "../lib/theme";

export default function GreetingSheet({
    reminder,
    visible,
    onClose,
}: {
    reminder: Reminder;
    visible: boolean;
    onClose: () => void;
}) {
    const t = useTranslation();
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        if (visible) setOffset(0);
    }, [visible]);

    const suggestions = buildGreetings(reminder, offset);
    const hasMore = greetingCount(reminder) > SUGGESTIONS_PER_PAGE;

    function pick(text: string) {
        onClose();
        // Let the sheet finish dismissing before handing over to the SMS composer.
        setTimeout(() => sendGreeting(text), 250);
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
                <Pressable
                    onPress={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: theme.surface,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        padding: 22,
                        paddingBottom: 40,
                        borderWidth: 1,
                        borderColor: theme.border,
                    }}
                >
                    <View
                        style={{
                            width: 38,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: theme.border,
                            alignSelf: "center",
                            marginBottom: 18,
                        }}
                    />

                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: "800" }}>
                        {t.greetingSheet.title(reminder.name)}
                    </Text>
                    <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 4 }}>
                        {t.greetingSheet.subtitle}
                    </Text>

                    <ScrollView style={{ marginTop: 18 }} showsVerticalScrollIndicator={false}>
                        {suggestions.map((text, i) => (
                            <Pressable
                                key={`${offset}-${i}`}
                                onPress={() => pick(text)}
                                style={({ pressed }) => ({
                                    backgroundColor: theme.surfaceAlt,
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 10,
                                    borderWidth: 1,
                                    borderColor: theme.border,
                                    opacity: pressed ? 0.7 : 1,
                                })}
                            >
                                <Text style={{ color: theme.text, fontSize: 15, lineHeight: 21 }}>{text}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {hasMore && (
                        <Pressable
                            onPress={() => setOffset(offset + SUGGESTIONS_PER_PAGE)}
                            style={{ padding: 14, alignItems: "center", marginTop: 4 }}
                        >
                            <Text style={{ color: theme.accent, fontWeight: "700", fontSize: 14 }}>
                                🔄 {t.greetingSheet.showOthers}
                            </Text>
                        </Pressable>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}
