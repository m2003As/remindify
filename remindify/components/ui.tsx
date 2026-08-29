import { ReactNode } from "react";
import { Image, Pressable, StyleProp, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";
import { Choice } from "../lib/types";
import { styles, theme } from "../lib/theme";

/* ---------- Text ---------- */

export function SectionLabel({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
    return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

/* ---------- Chips ---------- */

export function Chip({
    label,
    icon,
    selected,
    onPress,
}: {
    label: string;
    icon?: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingVertical: 9,
                paddingHorizontal: 14,
                borderRadius: 20,
                backgroundColor: selected ? theme.accentSoft : theme.surfaceAlt,
                borderWidth: 1,
                borderColor: selected ? theme.accent : theme.border,
                opacity: pressed ? 0.7 : 1,
            })}
        >
            {icon ? <Text style={{ fontSize: 15 }}>{icon}</Text> : null}
            <Text style={{ color: selected ? theme.accent : theme.textDim, fontSize: 13, fontWeight: "600" }}>
                {label}
            </Text>
        </Pressable>
    );
}

/** A wrapping row of chips where exactly one option is selected. Nothing is ever cut off. */
export function ChipRow<T extends string | number>({
    options,
    value,
    onChange,
    extra,
}: {
    options: Choice<T>[];
    value: T | null | undefined;
    onChange: (value: T) => void;
    /** Rendered after the options, e.g. an "add your own" chip. */
    extra?: ReactNode;
}) {
    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {options.map((o) => (
                <Chip
                    key={String(o.value)}
                    label={o.label}
                    icon={o.icon}
                    selected={value === o.value}
                    onPress={() => onChange(o.value)}
                />
            ))}
            {extra}
        </View>
    );
}

/* ---------- Buttons ---------- */

const TONES = {
    accent: { background: theme.accent, text: theme.bg, border: theme.accent },
    quiet: { background: theme.surfaceAlt, text: theme.text, border: theme.border },
    danger: { background: theme.dangerSoft, text: theme.danger, border: theme.dangerSoft },
    disabled: { background: theme.surfaceAlt, text: theme.textDim, border: theme.border },
};

export function Button({
    label,
    icon,
    onPress,
    tone = "accent",
    disabled,
    style,
}: {
    label: string;
    icon?: string;
    onPress: () => void;
    tone?: keyof typeof TONES;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}) {
    const colors = TONES[disabled ? "disabled" : tone];

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: 17,
                    borderRadius: 16,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                style,
            ]}
        >
            {icon ? <Text style={{ fontSize: 16 }}>{icon}</Text> : null}
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>{label}</Text>
        </Pressable>
    );
}

/* ---------- Inputs ---------- */

export function Input({ style, ...props }: TextInputProps) {
    return <TextInput placeholderTextColor={theme.placeholder} style={[styles.input, style]} {...props} />;
}

/* ---------- Rows ---------- */

export function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: theme.textDim, fontSize: 14 }}>{label}</Text>
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: "600" }}>{value}</Text>
        </View>
    );
}

/** A tappable settings-style row with a chevron. */
export function ListRow({
    icon,
    title,
    subtitle,
    onPress,
}: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    padding: 16,
                    marginBottom: 10,
                    opacity: pressed ? 0.7 : 1,
                },
            ]}
        >
            <Text style={{ fontSize: 20 }}>{icon}</Text>
            <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: "700", fontSize: 15 }}>{title}</Text>
                <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 2 }}>{subtitle}</Text>
            </View>
            <Text style={{ color: theme.textDim, fontSize: 18 }}>›</Text>
        </Pressable>
    );
}

/* ---------- Avatar ---------- */

/** Circular photo, falling back to an emoji on a flat background. */
export function Avatar({
    photoUri,
    fallback,
    size,
    highlight,
    dashed,
}: {
    photoUri?: string | null;
    fallback: string;
    size: number;
    highlight?: boolean;
    dashed?: boolean;
}) {
    const border = highlight
        ? { borderWidth: Math.max(2, Math.round(size / 50)), borderColor: theme.accent }
        : dashed
          ? { borderWidth: 2, borderColor: theme.border, borderStyle: "dashed" as const }
          : {};

    const shape = { width: size, height: size, borderRadius: size / 2, ...border };

    return photoUri ? (
        <Image source={{ uri: photoUri }} style={shape} />
    ) : (
        <View style={[shape, { backgroundColor: theme.surfaceAlt, alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ fontSize: size * 0.38 }}>{fallback}</Text>
        </View>
    );
}

/* ---------- Empty state ---------- */

export function EmptyState({
    icon,
    title,
    subtitle,
    children,
}: {
    icon: string;
    title: string;
    subtitle: string;
    children?: ReactNode;
}) {
    return (
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1, paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 14 }}>{icon}</Text>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700" }}>{title}</Text>
            <Text
                style={{
                    color: theme.textDim,
                    fontSize: 14,
                    marginTop: 8,
                    textAlign: "center",
                    lineHeight: 20,
                }}
            >
                {subtitle}
            </Text>
            {children}
        </View>
    );
}
