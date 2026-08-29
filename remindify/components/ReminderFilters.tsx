import { Pressable, Text, View } from "react-native";
import { useTranslation } from "../lib/i18n";
import { ReminderFilter, typeFilterChoices, TypeFilter } from "../lib/reminders";
import { theme } from "../lib/theme";
import { Chip, ChipRow, Input } from "./ui";

/** Search field and type chips, shared by every home view. */
export default function ReminderFilters({
    value,
    onChange,
}: {
    value: ReminderFilter;
    onChange: (filter: ReminderFilter) => void;
}) {
    const t = useTranslation();
    const patch = (changes: Partial<ReminderFilter>) => onChange({ ...value, ...changes });

    return (
        <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Input
                    value={value.query ?? ""}
                    onChangeText={(query) => patch({ query })}
                    placeholder={t.list.searchPlaceholder}
                    returnKeyType="search"
                    style={{ flex: 1, paddingVertical: 12, paddingLeft: 42, paddingRight: 42 }}
                />
                <Text style={{ position: "absolute", left: 15, fontSize: 15 }}>🔍</Text>
                {value.query !== "" && (
                    <Pressable
                        onPress={() => patch({ query: "" })}
                        hitSlop={12}
                        style={{ position: "absolute", right: 16 }}
                    >
                        <Text style={{ color: theme.textDim, fontSize: 16 }}>✕</Text>
                    </Pressable>
                )}
            </View>

            <ChipRow
                options={typeFilterChoices()}
                value={value.type ?? "all"}
                onChange={(type: TypeFilter) => patch({ type })}
                extra={
                    <Chip
                        label={t.list.thisMonth}
                        icon="📅"
                        selected={!!value.thisMonthOnly}
                        onPress={() => patch({ thisMonthOnly: !value.thisMonthOnly })}
                    />
                }
            />
        </View>
    );
}
