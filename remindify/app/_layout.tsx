import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { initDb } from "../lib/db";
import { theme } from "../lib/theme";

export default function RootLayout() {
    const router = useRouter();
    const handled = useRef<string | null>(null);
    const lastResponse = Notifications.useLastNotificationResponse();

    useEffect(() => { initDb(); }, []);

    useEffect(() => {
        if (!lastResponse) return;
        const req = lastResponse.notification.request;
        if (handled.current === req.identifier) return;

        const reminderId = req.content.data?.reminderId as string | undefined;
        if (reminderId) {
            handled.current = req.identifier;
            setTimeout(() => router.push(`/detail/${reminderId}`), 300);
        }
    }, [lastResponse]);

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
                <Stack.Screen name="settings" options={{ title: "Innstillinger" }} />
                <Stack.Screen name="import-contacts" options={{ title: "Importer bursdager", presentation: "modal" }} />
            </Stack>
        </>
    );
}