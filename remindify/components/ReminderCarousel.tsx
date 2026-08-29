import { useRef, useState } from "react";
import { Animated, Dimensions, View } from "react-native";
import { Reminder } from "../lib/types";
import { theme } from "../lib/theme";
import ReminderCover from "./ReminderCover";

const { width, height } = Dimensions.get("window");

const CARD_WIDTH = Math.round(width * 0.76);
/** Capped against screen height so the header above never squeezes the card off-screen. */
const CARD_HEIGHT = Math.min(Math.round(CARD_WIDTH * 1.38), Math.round(height * 0.48));
const CARD_GAP = 16;
const SNAP = CARD_WIDTH + CARD_GAP;
const MAX_DOTS = 12;

/** Horizontally snapping cards that scale down as they move off centre. */
export default function ReminderCarousel({ reminders }: { reminders: Reminder[] }) {
    const [active, setActive] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    return (
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
                    listener: (e: any) => setActive(Math.round(e.nativeEvent.contentOffset.x / SNAP)),
                })}
                renderItem={({ item, index }: { item: Reminder; index: number }) => {
                    const inputRange = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
                    const interpolate = (outputRange: number[]) =>
                        scrollX.interpolate({ inputRange, outputRange, extrapolate: "clamp" });

                    return (
                        <Animated.View
                            style={{
                                width: CARD_WIDTH,
                                marginHorizontal: CARD_GAP / 2,
                                transform: [{ scale: interpolate([0.92, 1, 0.92]) }],
                                opacity: interpolate([0.55, 1, 0.55]),
                            }}
                        >
                            <ReminderCover reminder={item} variant="large" width={CARD_WIDTH} height={CARD_HEIGHT} />
                        </Animated.View>
                    );
                }}
            />

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 7, marginTop: 26 }}>
                {reminders.slice(0, MAX_DOTS).map((reminder, i) => (
                    <View
                        key={reminder.id}
                        style={{
                            width: i === active ? 20 : 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: i === active ? theme.accent : theme.border,
                        }}
                    />
                ))}
            </View>
        </View>
    );
}
