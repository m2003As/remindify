import { Translation } from "./en";
import { Greetings, NotificationBodies } from "./types";

const greetings: Greetings = {
    birthday: {
        partner: [
            (c) => `Gratulerer med dagen, ${c.name} ❤️ Så utrolig glad i deg.`,
            (c) => `Hjertelig til lykke, ${c.name}! Håper dagen din blir like fin som du er.`,
            (c) => `Gratulerer med ${c.age}-årsdagen, elskede. Gleder meg til å feire deg. 🎂`,
            () => `Til lykke med dagen ❤️ Du gjør hver dag bedre, men i dag er det din tur.`,
        ],
        family: [
            (c) => `Gratulerer så mye med dagen, ${c.name}! 🎂 Håper du får en herlig dag.`,
            (c) => `Hjertelig til lykke med ${c.age}-årsdagen! Tenker på deg i dag. ❤️`,
            (c) => `Gratulerer, ${c.name}! Håper dagen blir feiret skikkelig.`,
            () => `Til lykke med dagen! 🎉 Klem fra meg.`,
        ],
        friend: [
            (c) => `Gratulerer med dagen, ${c.name}! 🎉 Håper du feirer skikkelig.`,
            (c) => `Gratulerer, ${c.age} år! 🎂 Nå må det bli kake.`,
            () => `Til lykke med dagen! Vi må ta en feiring snart. 🍻`,
            (c) => `Gratulerer, gamlis! 😄 Du bærer ${c.age} godt.`,
        ],
        colleague: [
            (c) => `Gratulerer med dagen, ${c.name}! Håper du får en fin feiring. 🎂`,
            () => `Til lykke med dagen! Ha en riktig god dag.`,
            (c) => `Gratulerer, ${c.name}! 🎉`,
        ],
        other: [
            (c) => `Gratulerer med dagen, ${c.name}! 🎂`,
            (c) => `Til lykke med ${c.age}-årsdagen! 🎉`,
            () => `Gratulerer så mye med dagen!`,
        ],
    },
    milestone: [
        (c) => `Gratulerer med ${c.age} år, ${c.name}! 🎉 Det er en runding som fortjener litt ekstra.`,
        (c) => `${c.age}! 🎂 Gratulerer så mye, ${c.name} — stor dag i dag.`,
    ],
    anniversary: {
        partner: [
            () => `Gratulerer med dagen vår ❤️ Takk for alt.`,
            (c) => `I dag er dagen vår. Glad i deg, ${c.name}. 💍`,
        ],
        family: [
            () => `Gratulerer med jubileet! 💍 Håper dere feirer godt.`,
            (c) => `Til lykke med dagen, ${c.name}! Så fint å tenke på.`,
        ],
        friend: [
            () => `Gratulerer med jubileet! 💍 Skål for dere.`,
            (c) => `Til lykke, ${c.name}! Fin dag å markere.`,
        ],
        colleague: [
            (c) => `Gratulerer med jubileet, ${c.name}! 💍`,
            () => `Til lykke med dagen!`,
        ],
        other: [
            () => `Gratulerer med jubileet! 💍`,
            (c) => `Til lykke med dagen, ${c.name}!`,
        ],
    },
    custom: [
        (c) => `Lykke til med ${c.label.toLowerCase()}, ${c.name}! ${c.icon}`,
        (c) => `Tenker på deg i dag, ${c.name}. ${c.icon}`,
        (c) => `${c.label} i dag — håper det går fint, ${c.name}!`,
        (c) => `Stor dag i dag, ${c.name}. Lykke til! ${c.icon}`,
    ],
};

const notificationBodies: NotificationBodies = {
    dayOfBirthday: [
        "Det er i dag. Ikke vær han som glemmer det.",
        "Dagen er her — send noe før frokosten er over.",
        "I dag er dagen. Ett trykk, så er du helten.",
        "Nå gjelder det. To minutter, og du har gjort noen glade.",
    ],
    dayOfGeneric: [
        "Dagen er i dag.",
        "Det er i dag — verdt et øyeblikk.",
        "I dag er dagen du skulle huske.",
    ],
    aheadBirthday: [
        "Fortsatt tid til å finne noe skikkelig bra.",
        "Nå, eller i panikk på selve dagen. Ditt valg.",
        "Perfekt tidspunkt å tenke gave.",
        "Du har tid. Bruk den mens du har den.",
    ],
    aheadGeneric: [
        "Litt tid til å forberede noe.",
        "Verdt å planlegge nå.",
        "Du er tidlig ute — det er en god ting.",
    ],
};

export const nb: Translation = {
    locale: "nb-NO",
    languageName: "Norsk",

    common: {
        cancel: "Avbryt",
        delete: "Slett",
        done: "Ferdig",
        ok: "OK",
        edit: "Rediger",
    },

    home: {
        specialDays: (count) => `${count} spesielle dager`,
        noneYet: "Ingen påminnelser ennå",
        emptyTitle: "Ingen påminnelser ennå",
        emptyBody: "Trykk på + for å legge til\ndin første bursdag eller merkedag",
        importFromContacts: "Importer fra kontakter",
        cards: "Kort",
        list: "Liste",
        year: "År",
    },

    list: {
        searchPlaceholder: "Søk i navn, type eller notater",
        showing: (shown, total) => `${shown} av ${total}`,
        noMatchesTitle: "Ingen treff",
        noMatchesBody: "Prøv et annet søkeord eller fjern filtrene",
        thisMonth: "Denne måneden",
        all: "Alle",
        other: "Egne",
    },

    year: {
        empty: "Ingenting denne måneden",
        count: (n) => (n === 1 ? "1 dato" : `${n} datoer`),
    },

    form: {
        newTitle: "Ny påminnelse",
        editTitle: "Rediger påminnelse",
        photoHint: "Trykk for å legge til bilde",
        addPhoto: "Legg til bilde",
        takePhoto: "Ta bilde",
        chooseFromLibrary: "Velg fra album",
        name: "Navn",
        namePlaceholder: "F.eks. Mamma",
        type: "Type",
        custom: "Egen",
        customPlaceholder: "F.eks. Eksamen, Flyttedag, Førerkort",
        relationship: "Relasjon (valgfritt)",
        date: "Dato",
        notifyMe: "Varsle meg",
        giftIdeas: "Gaveideer (valgfritt)",
        giftIdeasPlaceholder: "Ønsker seg…",
        create: "Lagre påminnelse",
        update: "Lagre endringer",
        nameMissingTitle: "Navn mangler",
        nameMissingBody: "Skriv inn et navn før du lagrer.",
        typeMissingTitle: "Type mangler",
        typeMissingBody: "Gi den egendefinerte typen et navn.",
    },

    detail: {
        sendGreeting: "Send hilsen",
        date: "Dato",
        comingUp: "Om",
        turning: "Fyller",
        reminder: "Varsel",
        relationship: "Relasjon",
        notSet: "Ikke satt",
        giftIdeas: "Gaveideer",
        noNotes: "Ingenting notert ennå.",
        deleteTitle: "Slette denne påminnelsen?",
        deleteBody: "Dette kan ikke angres.",
        deleteAction: "Slett påminnelse",
    },

    greetingSheet: {
        title: (name) => `Send hilsen til ${name}`,
        subtitle: "Velg et forslag — du kan redigere før du sender",
        showOthers: "Vis andre forslag",
    },

    settings: {
        title: "Innstillinger",
        contacts: "Kontakter",
        importBirthdays: "Importer bursdager",
        importBirthdaysSub: "Hent bursdager fra kontaktlisten",
        language: "Språk",
        languageSub: "Brukes i appen, hilsener og varsler",
        backup: "Sikkerhetskopi",
        exportTitle: "Eksporter backup",
        exportSub: "Lagre alle påminnelser som JSON-fil",
        exportFailed: "Kunne ikke eksportere",
        importTitle: "Importer backup",
        importSub: "Gjenopprett fra en tidligere fil",
        importFailed: "Kunne ikke importere",
        importDoneTitle: "Import fullført",
        importDoneBody: (count) => `${count} påminnelser gjenopprettet.`,
        photosNote: "Bilder følger ikke med i sikkerhetskopien — de ligger lokalt på telefonen.",
        saveDialogTitle: "Lagre backup",
        sharingUnavailable: "Deling er ikke tilgjengelig på denne enheten.",
        notABackup: "Filen ser ikke ut som en riMind-backup.",
    },

    importScreen: {
        reading: "Leser kontakter…",
        noAccess: "Ingen tilgang til kontakter.",
        failedTitle: "Kunne ikke lese kontakter",
        foundNone: "Fant ingen bursdager i kontaktene dine",
        found: (count) => `Fant ${count} bursdager`,
        add: (count) => `Legg til ${count}`,
        adding: "Legger til…",
        doneTitle: "Ferdig",
        doneBody: (count) => `${count} bursdager lagt til.`,
    },

    notFound: {
        title: "Ikke funnet",
        body: "Denne siden finnes ikke.",
        goHome: "Gå til startsiden",
    },

    date: {
        today: "I dag! 🎉",
        tomorrow: "I morgen",
        inDays: (days) => `Om ${days} dager`,
        soon: "SNART",
    },

    notify: {
        label: (days) => {
            if (days === 0) return "På dagen";
            if (days === 1) return "1 dag før";
            if (days === 7) return "1 uke før";
            return `${days} dager før`;
        },
    },

    types: {
        birthday: "Bursdag",
        anniversary: "Jubileum",
        custom: "Merkedag",
    },

    relations: {
        partner: "Partner",
        family: "Familie",
        friend: "Venn",
        colleague: "Kollega",
        other: "Annet",
    },

    notificationTitles: {
        birthdayToday: (name, age) => `🎂 ${name} fyller ${age} i dag`,
        birthdayAhead: (name, age, when) => `🎂 ${name} fyller ${age} ${when}`,
        genericToday: (icon, name) => `${icon} ${name} — i dag`,
        genericAhead: (icon, name, when) => `${icon} ${name} — ${when}`,
        milestone: "Rund dag!",
        milestoneAhead: (when) => `Rund dag ${when}`,
        birthday: "Bursdag",
        birthdayComingUp: "Bursdag på vei",
        tomorrow: "i morgen",
        inDays: (days) => `om ${days} dager`,
        greetAction: "💬 Send hilsen",
        snoozeAction: "Minn meg i kveld",
    },

    notificationBodies,
    greetings,
};
