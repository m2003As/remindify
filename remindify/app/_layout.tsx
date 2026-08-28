import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { initDb } from "../lib/db";
import { theme } from "../lib/theme";

export default function RootLayout() {
    useEffect(() => { initDb(); }, []);

    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: theme.bg },
                    headerTintColor: theme.accent,
                    headerTitleStyle: { color: theme.text, fontWeight: "700" },
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: theme.bg },
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="add" options={{ title: "Nytt minne", presentation: "modal" }} />
                <Stack.Screen name="detail/[id]" options={{ title: "" }} />
            </Stack>
        </>
    );
}