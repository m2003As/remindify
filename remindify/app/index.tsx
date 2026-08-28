import { FlatList, Text, View, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { getReminders } from "../lib/db";
import { Reminder } from "../lib/types";
import { sortByNextOccurrence } from "../lib/dateUtils";
import ReminderCard from "../components/ReminderCard";

export default function Home() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            setReminders(sortByNextOccurrence(getReminders()));
        }, [])
    );

    return (
        <View style={{ flex: 1, backgroundColor: "#121212" }}>
            <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
                <Text style={{ color: "#fff", fontSize: 30, fontWeight: "800" }}>Remindify</Text>
                <Text style={{ color: "#888", fontSize: 14, marginTop: 2 }}>
                    {reminders.length === 0 ? "Ingen minner ennå" : `${reminders.length} spesielle dager`}
                </Text>
            </View>

            <FlatList
                data={reminders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                renderItem={({ item }) => <ReminderCard reminder={item} />}
                ListEmptyComponent={
                    <View style={{ alignItems: "center", marginTop: 80 }}>
                        <Text style={{ fontSize: 48, marginBottom: 12 }}>🎁</Text>
                        <Text style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}>Ingen minner lagt til</Text>
                        <Text style={{ color: "#888", fontSize: 14, marginTop: 6, textAlign: "center" }}>
                            Trykk på + for å legge til{"\n"}din første bursdag eller merkedag
                        </Text>
                    </View>
                }
            />

            <Pressable
                onPress={() => router.push("/add")}
                style={{
                    position: "absolute", right: 20, bottom: 30,
                    backgroundColor: "#f2a900", width: 60, height: 60, borderRadius: 30,
                    alignItems: "center", justifyContent: "center",
                    shadowColor: "#f2a900", shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
                    elevation: 6,
                }}
            >
                <Text style={{ fontSize: 30, color: "#121212", fontWeight: "300" }}>+</Text>
            </Pressable>
        </View>
    );
}