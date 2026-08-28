import { useCallback, useRef, useState } from "react";
import { Animated, Dimensions, Image, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReminders } from "../lib/db";
import { Reminder } from "../lib/types";
import { sortByNextOccurrence, daysUntilNext, daysLabel, iconFor, labelFor } from "../lib/dateUtils";
import { theme } from "../lib/theme";
import { Logo } from "../components/Logo";

const { width } = Dimensions.get("window");
const CARD_W = Math.round(width * 0.76);
const CARD_H = Math.round(CARD_W * 1.38);
const SPACING = 16;
const SNAP = CARD_W + SPACING;
const SIDE = (width - CARD_W) / 2;

function Card({ reminder, index, scrollX }: { reminder: Reminder; index: number; scrollX: Animated.Value }) {
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

                {/* Lagvis skygge nedover — erstatter gradient uten ekstra pakke */}
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

export default function Home() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [active, setActive] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            setReminders(sortByNextOccurrence(getReminders()));
        }, [])
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <SafeAreaView edges={["top"]}>
                <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 4 }}>
                    <Logo size={32} />
                    <Text style={{ color: theme.textDim, fontSize: 14, marginTop: 8 }}>
                        {reminders.length === 0 ? "Ingen minner ennå" : `${reminders.length} spesielle dager`}
                    </Text>
                </View>
            </SafeAreaView>

            <View style={{ flex: 1, justifyContent: "center" }}>
                {reminders.length === 0 ? (
                    <View style={{ alignItems: "center", paddingHorizontal: 40 }}>
                        <Text style={{ fontSize: 52, marginBottom: 16 }}>🎁</Text>
                        <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700" }}>Ingen minner lagt til</Text>
                        <Text style={{ color: theme.textDim, fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
                            Trykk på + for å legge til{"\n"}din første bursdag eller merkedag
                        </Text>
                    </View>
                ) : (
                    <>
                        <Animated.FlatList
                            data={reminders}
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
                                    listener: (e: any) =>
                                        setActive(Math.round(e.nativeEvent.contentOffset.x / SNAP)),
                                }
                            )}
                            scrollEventThrottle={16}
                            renderItem={({ item, index }: { item: Reminder; index: number }) => (
                                <Card reminder={item} index={index} scrollX={scrollX} />
                            )}
                        />

                        <View style={{ flexDirection: "row", justifyContent: "center", gap: 7, marginTop: 26 }}>
                            {reminders.slice(0, 12).map((_, i) => (
                                <View
                                    key={i}
                                    style={{
                                        width: i === active ? 20 : 6, height: 6, borderRadius: 3,
                                        backgroundColor: i === active ? theme.accent : theme.border,
                                    }}
                                />
                            ))}
                        </View>
                    </>
                )}
            </View>

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