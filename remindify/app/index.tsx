import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReminders } from "../lib/db";
import { Reminder } from "../lib/types";
import {
    chunk,
    filterReminders,
    groupByMonth,
    MonthSection,
    sortByNextOccurrence,
    TYPE_FILTERS,
    TypeFilter,
} from "../lib/reminders";
import { styles, theme } from "../lib/theme";
import { Logo } from "../components/Logo";
import ReminderCover from "../components/ReminderCover";
import { Chip, ChipRow, EmptyState, Input } from "../components/ui";

const { width } = Dimensions.get("window");

const CARD_WIDTH = Math.round(width * 0.76);
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.38);
const CARD_GAP = 16;
const SNAP = CARD_WIDTH + CARD_GAP;

const GRID_PADDING = 20;
const GRID_GAP = 12;
const GRID_COLUMNS = 2;
const TILE_WIDTH = Math.floor((width - GRID_PADDING * 2 - GRID_GAP) / GRID_COLUMNS);
const TILE_HEIGHT = Math.round(TILE_WIDTH * 1.15);

const MAX_DOTS = 12;

type ViewMode = "carousel" | "grid";

type GridItem =
    | { kind: "header"; key: string; title: string }
    | { kind: "row"; key: string; items: Reminder[] };

function toGridItems(sections: MonthSection[]): GridItem[] {
    return sections.flatMap<GridItem>((section) => [
        { kind: "header", key: `header-${section.key}`, title: section.title },
        ...chunk(section.items, GRID_COLUMNS).map<GridItem>((items) => ({
            kind: "row",
            key: `row-${items[0].id}`,
            items,
        })),
    ]);
}

export default function Home() {
    const router = useRouter();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [view, setView] = useState<ViewMode>("carousel");
    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [thisMonthOnly, setThisMonthOnly] = useState(false);
    const [activeCard, setActiveCard] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            setReminders(sortByNextOccurrence(getReminders()));
        }, []),
    );

    const isGrid = view === "grid";
    const isFiltering = query.trim() !== "" || typeFilter !== "all" || thisMonthOnly;

    const visible = useMemo(
        () => (isGrid ? filterReminders(reminders, { query, type: typeFilter, thisMonthOnly }) : reminders),
        [reminders, isGrid, query, typeFilter, thisMonthOnly],
    );

    const gridItems = useMemo(() => (isGrid ? toGridItems(groupByMonth(visible)) : []), [isGrid, visible]);

    const subtitle =
        reminders.length === 0
            ? "No reminders yet"
            : isGrid && isFiltering
              ? `${visible.length} of ${reminders.length}`
              : `${reminders.length} special days`;

    return (
        <View style={styles.screen}>
            <SafeAreaView edges={["top"]}>
                <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Logo size={32} />
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Pressable
                                onPress={() => setView(isGrid ? "carousel" : "grid")}
                                hitSlop={10}
                                style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 12,
                                    borderRadius: 14,
                                    backgroundColor: theme.surfaceAlt,
                                    borderWidth: 1,
                                    borderColor: theme.border,
                                }}
                            >
                                <Text style={{ color: theme.textDim, fontSize: 12, fontWeight: "700" }}>
                                    {isGrid ? "Cards" : "Grid"}
                                </Text>
                            </Pressable>

                            <Pressable onPress={() => router.push("/settings")} hitSlop={10} style={{ padding: 6 }}>
                                <Text style={{ fontSize: 20 }}>⚙️</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Text style={{ color: theme.textDim, fontSize: 14, marginTop: 8 }}>{subtitle}</Text>
                </View>

                {isGrid && reminders.length > 0 && (
                    <View style={{ paddingHorizontal: GRID_PADDING, paddingTop: 14, gap: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Input
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search names, types or notes"
                                returnKeyType="search"
                                style={{ flex: 1, paddingLeft: 42, paddingRight: 42 }}
                            />
                            <Text style={{ position: "absolute", left: 15, fontSize: 15 }}>🔍</Text>
                            {query !== "" && (
                                <Pressable onPress={() => setQuery("")} hitSlop={12} style={{ position: "absolute", right: 16 }}>
                                    <Text style={{ color: theme.textDim, fontSize: 16 }}>✕</Text>
                                </Pressable>
                            )}
                        </View>

                        <ChipRow
                            options={TYPE_FILTERS}
                            value={typeFilter}
                            onChange={setTypeFilter}
                            extra={
                                <Chip
                                    label="This month"
                                    icon="📅"
                                    selected={thisMonthOnly}
                                    onPress={() => setThisMonthOnly(!thisMonthOnly)}
                                />
                            }
                        />
                    </View>
                )}
            </SafeAreaView>

            {reminders.length === 0 ? (
                <EmptyState
                    icon="🎁"
                    title="No reminders yet"
                    subtitle={"Tap + to add your first\nbirthday or special day"}
                >
                    <Pressable
                        onPress={() => router.push("/reminder/import")}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            backgroundColor: theme.accentSoft,
                            borderWidth: 1,
                            borderColor: theme.accent,
                            paddingVertical: 14,
                            paddingHorizontal: 22,
                            borderRadius: 16,
                            marginTop: 24,
                        }}
                    >
                        <Text style={{ fontSize: 16 }}>👥</Text>
                        <Text style={{ color: theme.accent, fontWeight: "700", fontSize: 14 }}>Import from contacts</Text>
                    </Pressable>
                </EmptyState>
            ) : isGrid ? (
                <FlatList
                    data={gridItems}
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={{ paddingHorizontal: GRID_PADDING, paddingTop: 18, paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", marginTop: 60, paddingHorizontal: 30 }}>
                            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
                            <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>No matches</Text>
                            <Text style={{ color: theme.textDim, fontSize: 14, marginTop: 6, textAlign: "center" }}>
                                Try another search term or clear the filters
                            </Text>
                        </View>
                    }
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
            ) : (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <Animated.FlatList
                        data={reminders}
                        horizontal
                        keyExtractor={(item: Reminder) => item.id}
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={SNAP}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 - CARD_GAP / 2 }}
                        scrollEventThrottle={16}
                        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                            useNativeDriver: true,
                            listener: (e: any) => setActiveCard(Math.round(e.nativeEvent.contentOffset.x / SNAP)),
                        })}
                        renderItem={({ item, index }: { item: Reminder; index: number }) => {
                            const range = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
                            return (
                                <Animated.View
                                    style={{
                                        width: CARD_WIDTH,
                                        marginHorizontal: CARD_GAP / 2,
                                        transform: [
                                            {
                                                scale: scrollX.interpolate({
                                                    inputRange: range,
                                                    outputRange: [0.92, 1, 0.92],
                                                    extrapolate: "clamp",
                                                }),
                                            },
                                        ],
                                        opacity: scrollX.interpolate({
                                            inputRange: range,
                                            outputRange: [0.55, 1, 0.55],
                                            extrapolate: "clamp",
                                        }),
                                    }}
                                >
                                    <ReminderCover
                                        reminder={item}
                                        variant="large"
                                        width={CARD_WIDTH}
                                        height={CARD_HEIGHT}
                                    />
                                </Animated.View>
                            );
                        }}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "center", gap: 7, marginTop: 26 }}>
                        {reminders.slice(0, MAX_DOTS).map((reminder, i) => (
                            <View
                                key={reminder.id}
                                style={{
                                    width: i === activeCard ? 20 : 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: i === activeCard ? theme.accent : theme.border,
                                }}
                            />
                        ))}
                    </View>
                </View>
            )}

            <Pressable
                onPress={() => router.push("/reminder/new")}
                style={({ pressed }) => ({
                    position: "absolute",
                    right: 22,
                    bottom: 42,
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                    backgroundColor: theme.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                    shadowColor: theme.accent,
                    shadowOpacity: 0.5,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 10,
                })}
            >
                <Text style={{ fontSize: 32, color: theme.bg, fontWeight: "300", marginTop: -2 }}>+</Text>
            </Pressable>
        </View>
    );
}
