export const theme = {
    bg: "#0B0B0F",
    surface: "#16161C",
    surfaceAlt: "#1E1E26",
    border: "#26262F",
    text: "#FFFFFF",
    textDim: "#8A8A99",
    textMuted: "#C8C8D4",
    placeholder: "#5A5A66",
    accent: "#F2A900",
    accentSoft: "rgba(242,169,0,0.13)",
    danger: "#E05C5C",
    dangerSoft: "#2A1618",
};

/** Style fragments reused across screens. */
export const styles = {
    screen: { flex: 1, backgroundColor: theme.bg } as const,

    card: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
    } as const,

    input: {
        backgroundColor: theme.surfaceAlt,
        color: theme.text,
        padding: 16,
        borderRadius: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.border,
    } as const,

    sectionLabel: {
        color: theme.textDim,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 10,
    } as const,
};
