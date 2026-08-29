import { useCallback, useMemo, useRef, useState } from "react";
import {
    Animated, Dimensions, FlatList, Image, Pressable,
    Text, TextInput, View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReminders } from "../lib/db";
import { Reminder } from "../lib/types";
import {
    sortByNextOccurrence, daysUntilNext, daysLabel, iconFor, labelFor,
    monthKey, monthTitle, isThisMonth, matchesQuery, matchesTypeFilter, TypeFilter,
} from "../lib/dateUtils";
import { theme } from "../lib/theme";
import { Logo } from "../components/Logo";

const { width } = Dimensions.get("window");

const CARD_W = Math.round(width * 0.76);
const CARD_H = Math.round(CARD_W * 1.38);
const SPACING = 16;
const SNAP = CARD_W + SPACING;
const SIDE = (width - CARD_W) / 2;

const GRID_PAD = 20;
const GRID_GAP = 12;
const TILE_W = Math.floor((width - GRID_PAD * 2 - GRID_GAP) / 2);
const TILE_H = Math.round(TILE_W * 1.15);

const FILTERS: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "Alle" },
    { value: "birthday", label: "🎂 Bursdag" },
    { value: "anniversary", label: "💍 Jubileum" },
    { value: "other", label: "⭐ Egne" },
];

/* ---------- Kortstabel ---------- */

function StackCard({ reminder, index, scrollX }: { reminder: Reminder; index: number; scrollX: Animated.Value }) {
    const router = useRouter();
    const days = daysUntilNext(reminder.date);
    const soon = days <= 7;

    const inputRange = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
    const scale = scrollX.interpolate({ inputRange, outputRange: [0.92, 1, 0.92], extrapolate: "clamp" });
    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.55, 1, 0.55], extrapolate: "clamp" });

    return (
        <Animated.View style={{ width: CARD_W, marginHorizontal: SPACING / 2, transform: [{ scale }], opacity }}>
            <Pressable
                onPress={() => router.push(`/detail/${reminder.id}`)}
                style={{
                    height: CARD_H, borderRadius: 30, overflow: "hidden",
                    backgroundColor: theme.surface,
                    borderWidth: 1, borderColor: soon ? theme.accent : theme.border,
                    shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 24, shadowOffset: { width: 0, height: 12 },
                    elevation: 10,
                }}
            >
                {reminder.photoUri ? (
                    <Image
                        source={{ uri: reminder.photoUri }}
                        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.surfaceAlt }}>
                        <Text style={{ fontSize: 88 }}>{iconFor(reminder)}</Text>
                    </View>
                )}

                <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, backgroundColor: "rgba(11,11,15,0.35)" }} />
                <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 105, backgroundColor: "rgba(11,11,15,0.45)" }} />
                <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, backgroundColor: "rgba(11,11,15,0.6)" }} />

                {soon && (
                    <View style={{
                        position: "absolute", top: 16, right: 16,
                        backgroundColor: theme.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                    }}>
                        <Text style={{ color: theme.bg, fontSize: 11, fontWeight: "900", letterSpacing: 0.8 }}>SNART</Text>
                    </View>
                )}

                <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 20 }}>
                    <Text style={{ color: theme.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }}>
                        {iconFor(reminder)}  {labelFor(reminder).toUpperCase()}
                    </Text>
                    <Text style={{ color: theme.text, fontSize: 26, fontWeight: "800", marginTop: 6, letterSpacing: -0.5 }} numberOfLines={1}>
                        {reminder.name}
                    </Text>
                    <Text style={{ color: "#D8D8E0", fontSize: 15, marginTop: 3 }}>{daysLabel(days)}</Text>
                </View>
            </Pressable>
        </Animated.View>
    );
}

/* ---------- Rutenett ---------- */

function Tile({ reminder }: { reminder: Reminder }) {
    const router = useRouter();
    const days = daysUntilNext(reminder.date);
    const soon = days <= 7;

    return (
        <Pressable
            onPress={() => router.push(`/detail/${reminder.id}`)}
            style={({ pressed }) => ({
                width: TILE_W, height: TILE_H, borderRadius: 22, overflow: "hidden",
                backgroundColor: theme.surface,
                borderWidth: 1, borderColor: soon ? theme.accent : theme.border,
                opacity: pressed ? 0.75 : 1,
            })}
        >
            {reminder.photoUri ? (
                <Image
                    source={{ uri: reminder.photoUri }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                    resizeMode="cover"
                />
            ) : (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.surfaceAlt }}>
                    <Text style={{ fontSize: 44 }}>{iconFor(reminder)}</Text>
                </View>
            )}

            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 88, backgroundColor: "rgba(11,11,15,0.4)" }} />
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 58, backgroundColor: "rgba(11,11,15,0.62)" }} />

            {soon && (
                <View style={{
                    position: "absolute", top: 10, right: 10,
                    backgroundColor: theme.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
                }}>
                    <Text style={{ color: theme.bg, fontSize: 9, fontWeight: "900", letterSpacing: 0.6 }}>SNART</Text>
                </View>
            )}

            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 12 }}>
                <Text style={{ color: theme.text, fontSize: 15, fontWeight: "800" }} numberOfLines={1}>
                    {reminder.name}
                </Text>
                <Text style={{ color: "#C8C8D4", fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {iconFor(reminder)} {daysLabel(days)}
                </Text>
            </View>
        </Pressable>
    );
}

type GridItem =
    | { kind: "header"; key: string; title: string }
    | { kind: "row"; key: string; items: Reminder[] };

function buildGrid(list: Reminder[]): GridItem[] {
    const out: GridItem[] = [];
    let current = "";
    let bucket: Reminder[] = [];

    const flush = () => {
        for (let i = 0; i < bucket.length; i += 2) {
            out.push({ kind: "row", key: `row-${bucket[i].id}`, items: bucket.slice(i, i + 2) });
        }
        bucket = [];
    };

    for (const r of list) {
        const k = monthKey(r.date);
        if (k !== current) {
            flush();
            current = k;
            out.push({ kind: "header", key: `h-${k}`, title: monthTitle(r.date) });
        }
        bucket.push(r);
    }
    flush();
    return out;
}

/* ---------- Skjerm ---------- */

export default function Home() {
    const [all, setAll] = useState<Reminder[]>([]);
    const [mode, setMode] = useState<"stack" | "grid">("stack");
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<TypeFilter>("all");
    const [monthOnly, setMonthOnly] = useState(false);
    const [active, setActive] = useState(0);

    const scrollX = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            setAll(sortByNextOccurrence(getReminders()));
        }, [])
    );

    const filtered = useMemo(() => {
        if (mode === "stack") return all;
        return all.filter(
            (r) =>
                matchesQuery(r, query) &&
                matchesTypeFilter(r, filter) &&
                (!monthOnly || isThisMonth(r.date))
        );
    }, [all, mode, query, filter, monthOnly]);

    const grid = useMemo(() => (mode === "grid" ? buildGrid(filtered) : []), [mode, filtered]);
    const isFiltering = query.trim() !== "" || filter !== "all" || monthOnly;

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <SafeAreaView edges={["top"]}>
                <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Logo size={32} />
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Pressable
                                onPress={() => setMode(mode === "stack" ? "grid" : "stack")}
                                hitSlop={10}
                                style={{
                                    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14,
                                    backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border,
                                }}
                            >
                                <Text style={{ color: theme.textDim, fontSize: 12, fontWeight: "700" }}>
                                    {mode === "stack" ? "Rutenett" : "Kort"}
                                </Text>
                            </Pressable>

                            <Pressable onPress={() => router.push("/settings")} hitSlop={10} style={{ padding: 6 }}>
                                <Text style={{ fontSize: 20 }}>⚙️</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Text style={{ color: theme.textDim, fontSize: 14, marginTop: 8 }}>
                        {all.length === 0
                            ? "Ingen minner ennå"
                            : mode === "grid" && isFiltering
                                ? `${filtered.length} av ${all.length}`
                                : `${all.length} spesielle dager`}
                    </Text>
                </View>

                {mode === "grid" && all.length > 0 && (
                    <View style={{ paddingHorizontal: GRID_PAD, paddingTop: 14 }}>
                        <View style={{
                            flexDirection: "row", alignItems: "center", gap: 10,
                            backgroundColor: theme.surface, borderRadius: 14, paddingHorizontal: 14,
                            borderWidth: 1, borderColor: theme.border,
                        }}>
                            <Text style={{ fontSize: 15, color: theme.textDim }}>🔍</Text>
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Søk i navn, type eller notater"
                                placeholderTextColor="#5A5A66"
                                returnKeyType="search"
                                style={{ flex: 1, color: theme.text, fontSize: 15, paddingVertical: 12 }}
                            />
                            {query !== "" && (
                                <Pressable onPress={() => setQuery("")} hitSlop={10}>
                                    <Text style={{ color: theme.textDim, fontSize: 16 }}>✕</Text>
                                </Pressable>
                            )}
                        </View>

                        <FlatList
                            data={FILTERS}
                            horizontal
                            keyExtractor={(f) => f.value}
                            showsHorizontalScrollIndicator={false}
                            style={{ marginTop: 12, marginHorizontal: -GRID_PAD }}
                            contentContainerStyle={{ paddingHorizontal: GRID_PAD, gap: 8 }}
                            ListFooterComponent={
                                <Pressable
                                    onPress={() => setMonthOnly(!monthOnly)}
                                    style={{
                                        paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18,
                                        backgroundColor: monthOnly ? theme.accentSoft : theme.surfaceAlt,
                                        borderWidth: 1, borderColor: monthOnly ? theme.accent : theme.border,
                                    }}
                                >
                                    <Text style={{ color: monthOnly ? theme.accent : theme.textDim, fontSize: 13, fontWeight: "600" }}>
                                        📅 Denne måneden
                                    </Text>
                                </Pressable>
                            }
                            renderItem={({ item }) => {
                                const on = filter === item.value;
                                return (
                                    <Pressable
                                        onPress={() => setFilter(item.value)}
                                        style={{
                                            paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18,
                                            backgroundColor: on ? theme.accentSoft : theme.surfaceAlt,
                                            borderWidth: 1, borderColor: on ? theme.accent : theme.border,
                                        }}
                                    >
                                        <Text style={{ color: on ? theme.accent : theme.textDim, fontSize: 13, fontWeight: "600" }}>
                                            {item.label}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                        />
                    </View>
                )}
            </SafeAreaView>

            {/* Tomt bibliotek */}
            {all.length === 0 ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
                    <Text style={{ fontSize: 52, marginBottom: 16 }}>🎁</Text>
                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700" }}>Ingen minner lagt til</Text>
                    <Text style={{ color: theme.textDim, fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
                        Trykk på + for å legge til{"\n"}din første bursdag eller merkedag
                    </Text>
                    <Pressable
                        onPress={() => router.push("/import-contacts")}
                        style={{
                            flexDirection: "row", alignItems: "center", gap: 8,
                            backgroundColor: theme.accentSoft, borderWidth: 1, borderColor: theme.accent,
                            paddingVertical: 14, paddingHorizontal: 22, borderRadius: 16, marginTop: 24,
                        }}
                    >
                        <Text style={{ fontSize: 16 }}>👥</Text>
                        <Text style={{ color: theme.accent, fontWeight: "700", fontSize: 14 }}>
                            Importer fra kontakter
                        </Text>
                    </Pressable>
                </View>
            ) : mode === "stack" ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <Animated.FlatList
                        data={all}
                        horizontal
                        keyExtractor={(item: Reminder) => item.id}
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={SNAP}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: SIDE - SPACING / 2 }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            {
                                useNativeDriver: true,
                                listener: (e: any) => setActive(Math.round(e.nativeEvent.contentOffset.x / SNAP)),
                            }
                        )}
                        scrollEventThrottle={16}
                        renderItem={({ item, index }: { item: Reminder; index: number }) => (
                            <StackCard reminder={item} index={index} scrollX={scrollX} />
                        )}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "center", gap: 7, marginTop: 26 }}>
                        {all.slice(0, 12).map((_, i) => (
                            <View
                                key={i}
                                style={{
                                    width: i === active ? 20 : 6, height: 6, borderRadius: 3,
                                    backgroundColor: i === active ? theme.accent : theme.border,
                                }}
                            />
                        ))}
                    </View>
                </View>
            ) : (
                <FlatList
                    data={grid}
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={{ paddingHorizontal: GRID_PAD, paddingTop: 18, paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", marginTop: 60, paddingHorizontal: 30 }}>
                            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
                            <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>Ingen treff</Text>
                            <Text style={{ color: theme.textDim, fontSize: 14, marginTop: 6, textAlign: "center" }}>
                                Prøv et annet søkeord eller fjern filtrene
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) =>
                        item.kind === "header" ? (
                            <Text style={{
                                color: theme.textDim, fontSize: 11, fontWeight: "800",
                                letterSpacing: 1.2, textTransform: "uppercase",
                                marginTop: 18, marginBottom: 12,
                            }}>
                                {item.title}
                            </Text>
                        ) : (
                            <View style={{ flexDirection: "row", gap: GRID_GAP, marginBottom: GRID_GAP }}>
                                {item.items.map((r) => <Tile key={r.id} reminder={r} />)}
                            </View>
                        )
                    }
                />
            )}

            <Pressable
                onPress={() => router.push("/add")}
                style={({ pressed }) => ({
                    position: "absolute", right: 22, bottom: 42,
                    backgroundColor: theme.accent, width: 62, height: 62, borderRadius: 31,
                    alignItems: "center", justifyContent: "center",
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                    shadowColor: theme.accent, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
                    elevation: 10,
                })}
            >
                <Text style={{ fontSize: 32, color: theme.bg, fontWeight: "300", marginTop: -2 }}>+</Text>
            </Pressable>
        </View>
    );
}