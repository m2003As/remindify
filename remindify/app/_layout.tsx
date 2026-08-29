import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initDb } from "../lib/db";
import { GREET_ACTION, registerCategories } from "../lib/notifications";
import { theme } from "../lib/theme";

/** Gives the router a moment to mount before we navigate from a cold start. */
const NAVIGATE_DELAY_MS = 300;

export default function RootLayout() {
    const router = useRouter();
    const handledId = useRef<string | null>(null);
    const response = Notifications.useLastNotificationResponse();

    useEffect(() => {
        initDb();
        registerCategories();
    }, []);

    useEffect(() => {
        if (!response) return;

        const request = response.notification.request;
        const reminderId = request.content.data?.reminderId as string | undefined;
        if (!reminderId || handledId.current === request.identifier) return;

        handledId.current = request.identifier;
        const greet = response.actionIdentifier === GREET_ACTION ? "1" : undefined;
        const timer = setTimeout(
            () => router.push({ pathname: "/reminder/[id]", params: { id: reminderId, greet } }),
            NAVIGATE_DELAY_MS,
        );

        return () => clearTimeout(timer);
    }, [response]);

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
                <Stack.Screen name="reminder/new" options={{ title: "New reminder", presentation: "modal" }} />
                <Stack.Screen name="reminder/[id]" options={{ title: "" }} />
                <Stack.Screen name="reminder/import" options={{ title: "Import birthdays", presentation: "modal" }} />
                <Stack.Screen name="settings" options={{ title: "Settings" }} />
            </Stack>
        </>
    );
}
