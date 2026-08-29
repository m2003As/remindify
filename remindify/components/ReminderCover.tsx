import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Reminder } from "../lib/types";
import { daysLabel, daysUntil } from "../lib/date";
import { iconFor, labelFor } from "../lib/reminders";
import { theme } from "../lib/theme";

/** A reminder is highlighted once its date is within this many days. */
export const SOON_DAYS = 7;

/** Height and opacity of each darkening layer behind the footer text. */
const VARIANTS = {
    large: {
        radius: 30, emoji: 88, padding: 20, badge: 11, name: 26,
        scrims: [[150, 0.35], [105, 0.45], [70, 0.6]],
    },
    small: {
        radius: 22, emoji: 44, padding: 12, badge: 9, name: 15,
        scrims: [[88, 0.4], [58, 0.62]],
    },
};

const fill = { position: "absolute", left: 0, right: 0, bottom: 0 } as const;

/**
 * Photo-or-emoji cover with a darkened footer, used for both the home
 * carousel cards and the grid tiles.
 */
export default function ReminderCover({
    reminder,
    variant,
    width,
    height,
}: {
    reminder: Reminder;
    variant: keyof typeof VARIANTS;
    width: number;
    height: number;
}) {
    const router = useRouter();
    const days = daysUntil(reminder.date);
    const soon = days <= SOON_DAYS;
    const v = VARIANTS[variant];
    const isLarge = variant === "large";

    return (
        <Pressable
            onPress={() => router.push({ pathname: "/reminder/[id]", params: { id: reminder.id } })}
            style={({ pressed }) => ({
                width,
                height,
                borderRadius: v.radius,
                overflow: "hidden",
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: soon ? theme.accent : theme.border,
                opacity: pressed && !isLarge ? 0.75 : 1,
            })}
        >
            {reminder.photoUri ? (
                <Image source={{ uri: reminder.photoUri }} style={{ ...fill, top: 0 }} resizeMode="cover" />
            ) : (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.surfaceAlt }}>
                    <Text style={{ fontSize: v.emoji }}>{iconFor(reminder)}</Text>
                </View>
            )}

            {/* Stacked translucent layers approximate a gradient without an extra dependency. */}
            {v.scrims.map(([height, opacity]) => (
                <View key={height} style={{ ...fill, height, backgroundColor: `rgba(11,11,15,${opacity})` }} />
            ))}

            {soon && (
                <View
                    style={{
                        position: "absolute",
                        top: isLarge ? 16 : 10,
                        right: isLarge ? 16 : 10,
                        backgroundColor: theme.accent,
                        paddingHorizontal: isLarge ? 12 : 8,
                        paddingVertical: isLarge ? 6 : 3,
                        borderRadius: 20,
                    }}
                >
                    <Text style={{ color: theme.bg, fontSize: v.badge, fontWeight: "900", letterSpacing: 0.7 }}>
                        SOON
                    </Text>
                </View>
            )}

            <View style={{ ...fill, padding: v.padding }}>
                {isLarge && (
                    <Text style={{ color: theme.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }}>
                        {iconFor(reminder)}  {labelFor(reminder).toUpperCase()}
                    </Text>
                )}
                <Text
                    style={{
                        color: theme.text,
                        fontSize: v.name,
                        fontWeight: "800",
                        marginTop: isLarge ? 6 : 0,
                        letterSpacing: isLarge ? -0.5 : 0,
                    }}
                    numberOfLines={1}
                >
                    {reminder.name}
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: isLarge ? 15 : 12, marginTop: 2 }} numberOfLines={1}>
                    {isLarge ? daysLabel(days) : `${iconFor(reminder)} ${daysLabel(days)}`}
                </Text>
            </View>
        </Pressable>
    );
}
