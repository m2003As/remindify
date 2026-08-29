import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReminders } from "../lib/db";
import { useTranslation } from "../lib/i18n";
import { filterReminders, isFiltering, ReminderFilter, sortByNextOccurrence } from "../lib/reminders";
import { Choice, Reminder } from "../lib/types";
import { styles, theme } from "../lib/theme";
import { Logo } from "../components/Logo";
import ReminderCarousel from "../components/ReminderCarousel";
import ReminderFilters from "../components/ReminderFilters";
import ReminderTiles from "../components/ReminderTiles";
import YearOverview from "../components/YearOverview";
import { ChipRow, EmptyState } from "../components/ui";

type ViewMode = "cards" | "list" | "year";

const NO_FILTER: ReminderFilter = { query: "", type: "all", thisMonthOnly: false };

/** Breathing room between the header controls and the content below them. */
const HEADER_BOTTOM_SPACE = 22;

export default function Home() {
    const router = useRouter();
    const t = useTranslation();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [view, setView] = useState<ViewMode>("list");
    const [filter, setFilter] = useState<ReminderFilter>(NO_FILTER);

    useFocusEffect(
        useCallback(() => {
            setReminders(sortByNextOccurrence(getReminders()));
        }, []),
    );

    const visible = useMemo(() => filterReminders(reminders, filter), [reminders, filter]);
    const filtering = isFiltering(filter);

    const views: Choice<ViewMode>[] = [
        { value: "cards", label: t.home.cards },
        { value: "list", label: t.home.list },
        { value: "year", label: t.home.year },
    ];

    function content() {
        if (visible.length === 0) {
            return (
                <EmptyState icon="🔍" title={t.list.noMatchesTitle} subtitle={t.list.noMatchesBody} />
            );
        }
        if (view === "cards") return <ReminderCarousel reminders={visible} />;
        if (view === "list") return <ReminderTiles reminders={visible} grouped />;
        return <YearOverview reminders={visible} />;
    }

    return (
        <View style={styles.screen}>
            <SafeAreaView edges={["top"]}>
                <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: HEADER_BOTTOM_SPACE, gap: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Logo size={32} />
                        <Pressable onPress={() => router.push("/settings")} hitSlop={10} style={{ padding: 6 }}>
                            <Text style={{ fontSize: 20 }}>⚙️</Text>
                        </Pressable>
                    </View>

                    <Text style={{ color: theme.textDim, fontSize: 14 }}>
                        {reminders.length === 0
                            ? t.home.noneYet
                            : filtering
                              ? t.list.showing(visible.length, reminders.length)
                              : t.home.specialDays(reminders.length)}
                    </Text>

                    {reminders.length > 0 && (
                        <>
                            <ChipRow options={views} value={view} onChange={setView} />
                            <ReminderFilters value={filter} onChange={setFilter} />
                        </>
                    )}
                </View>
            </SafeAreaView>

            {reminders.length === 0 ? (
                <EmptyState icon="🎁" title={t.home.emptyTitle} subtitle={t.home.emptyBody}>
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
                        <Text style={{ color: theme.accent, fontWeight: "700", fontSize: 14 }}>
                            {t.home.importFromContacts}
                        </Text>
                    </Pressable>
                </EmptyState>
            ) : (
                content()
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
