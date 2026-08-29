import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { monthName } from "../lib/date";
import { useTranslation } from "../lib/i18n";
import { groupByCalendarMonth, iconFor, MONTHS_IN_YEAR } from "../lib/reminders";
import { Reminder } from "../lib/types";
import { styles, theme } from "../lib/theme";

const { width } = Dimensions.get("window");

const PADDING = 20;
const GAP = 10;
const COLUMNS = 3;
const CARD_WIDTH = Math.floor((width - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS);
const MAX_ICONS = 4;

/** All twelve months at a glance; tapping one opens that month's dates. */
export default function YearOverview({ reminders }: { reminders: Reminder[] }) {
    const router = useRouter();
    const t = useTranslation();
    const months = groupByCalendarMonth(reminders);
    const currentMonth = new Date().getMonth();

    return (
        <ScrollView contentContainerStyle={{ padding: PADDING, paddingTop: 4, paddingBottom: 120 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
                {Array.from({ length: MONTHS_IN_YEAR }, (_, month) => {
                    const items = months[month];
                    const isCurrent = month === currentMonth;
                    const isEmpty = items.length === 0;

                    return (
                        <Pressable
                            key={month}
                            disabled={isEmpty}
                            onPress={() => router.push({ pathname: "/month/[month]", params: { month } })}
                            style={({ pressed }) => [
                                styles.card,
                                {
                                    width: CARD_WIDTH,
                                    minHeight: 96,
                                    padding: 12,
                                    justifyContent: "space-between",
                                    borderColor: isCurrent ? theme.accent : theme.border,
                                    opacity: isEmpty ? 0.45 : pressed ? 0.7 : 1,
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: isCurrent ? theme.accent : theme.text,
                                    fontSize: 14,
                                    fontWeight: "800",
                                }}
                                numberOfLines={1}
                            >
                                {monthName(month)}
                            </Text>

                            <Text style={{ color: theme.textDim, fontSize: 18, height: 24 }} numberOfLines={1}>
                                {items.slice(0, MAX_ICONS).map(iconFor).join("")}
                            </Text>

                            <Text style={{ color: theme.textDim, fontSize: 11, fontWeight: "600" }}>
                                {isEmpty ? t.year.empty : t.year.count(items.length)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </ScrollView>
    );
}
