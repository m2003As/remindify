import { Stack } from "expo-router";
import { useEffect } from "react";
import { initDb } from "../lib/db";

export default function RootLayout() {
  useEffect(() => {
    initDb();
  }, []);

  return (
      <Stack>
        <Stack.Screen name="index" options={{ title: "Remindify" }} />
        <Stack.Screen name="add" options={{ title: "Legg til", presentation: "modal" }} />
        <Stack.Screen name="detail/[id]" options={{ title: "Detaljer" }} />
      </Stack>
  );
}