import { ReactElement } from "react";
import { Dimensions, FlatList, Text, View } from "react-native";
import { chunk, groupByMonth, MonthSection } from "../lib/reminders";
import { Reminder } from "../lib/types";
import { styles } from "../lib/theme";
import ReminderCover from "./ReminderCover";

const { width } = Dimensions.get("window");

export const GRID_PADDING = 20;
const GRID_GAP = 12;
const COLUMNS = 2;
const TILE_WIDTH = Math.floor((width - GRID_PADDING * 2 - GRID_GAP) / COLUMNS);
const TILE_HEIGHT = Math.round(TILE_WIDTH * 1.15);

type Row =
    | { kind: "header"; key: string; title: string }
    | { kind: "row"; key: string; items: Reminder[] };

const tileRows = (items: Reminder[], keyPrefix: string): Row[] =>
    chunk(items, COLUMNS).map((row) => ({ kind: "row", key: `${keyPrefix}-${row[0].id}`, items: row }));

const flatRows = (reminders: Reminder[]): Row[] => tileRows(reminders, "row");

const sectionRows = (sections: MonthSection[]): Row[] =>
    sections.flatMap<Row>((section) => [
        { kind: "header", key: `header-${section.key}`, title: section.title },
        ...tileRows(section.items, section.key),
    ]);

/** Two-column grid of reminder tiles, optionally split into month sections. */
export default function ReminderTiles({
    reminders,
    grouped = false,
    empty,
}: {
    reminders: Reminder[];
    /** Insert a month heading whenever the month changes. Expects a sorted list. */
    grouped?: boolean;
    empty?: ReactElement;
}) {
    const rows = grouped ? sectionRows(groupByMonth(reminders)) : flatRows(reminders);

    return (
        <FlatList
            data={rows}
            keyExtractor={(row) => row.key}
            contentContainerStyle={{ paddingHorizontal: GRID_PADDING, paddingTop: 12, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={empty}
            renderItem={({ item }) =>
                item.kind === "header" ? (
                    <Text style={[styles.sectionLabel, { fontSize: 11, marginTop: 18, marginBottom: 12 }]}>
                        {item.title}
                    </Text>
                ) : (
                    <View style={{ flexDirection: "row", gap: GRID_GAP, marginBottom: GRID_GAP }}>
                        {item.items.map((reminder) => (
                            <ReminderCover
                                key={reminder.id}
                                reminder={reminder}
                                variant="small"
                                width={TILE_WIDTH}
                                height={TILE_HEIGHT}
                            />
                        ))}
                    </View>
                )
            }
        />
    );
}
