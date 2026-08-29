import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getReminders } from "../../lib/db";
import { monthName } from "../../lib/date";
import { useTranslation } from "../../lib/i18n";
import { groupByCalendarMonth, MONTHS_IN_YEAR } from "../../lib/reminders";
import { Reminder } from "../../lib/types";
import { styles, theme } from "../../lib/theme";
import ReminderTiles from "../../components/ReminderTiles";

/** Every date in one calendar month, reached from the year overview. */
export default function MonthDetail() {
    const { month } = useLocalSearchParams<{ month: string }>();
    const t = useTranslation();
    const [items, setItems] = useState<Reminder[]>([]);
    const index = Number(month);
    const valid = Number.isInteger(index) && index >= 0 && index < MONTHS_IN_YEAR;

    useFocusEffect(
        useCallback(() => {
            if (valid) setItems(groupByCalendarMonth(getReminders())[index]);
        }, [index, valid]),
    );

    return (
        <View style={styles.screen}>
            <Stack.Screen options={{ title: valid ? monthName(index) : "" }} />
            <ReminderTiles
                reminders={items}
                empty={
                    <Text style={{ color: theme.textDim, fontSize: 14, textAlign: "center", marginTop: 60 }}>
                        {t.year.empty}
                    </Text>
                }
            />
        </View>
    );
}
