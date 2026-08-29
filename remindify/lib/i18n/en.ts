import { Greetings, NotificationBodies } from "./types";

/** "21st", "22nd", "13th" … */
function ordinal(n: number): string {
    const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th");
    return `${n}${suffix}`;
}

const greetings: Greetings = {
    birthday: {
        partner: [
            (c) => `Happy birthday, ${c.name} ❤️ I love you so much.`,
            () => `Happy birthday! Hope your day is as lovely as you are.`,
            (c) => `Happy ${ordinal(c.age)}, my love. Can't wait to celebrate you. 🎂`,
            () => `Happy birthday ❤️ You make every day better — today it's your turn.`,
        ],
        family: [
            (c) => `Happy birthday, ${c.name}! 🎂 Hope you have a wonderful day.`,
            (c) => `Happy ${ordinal(c.age)} birthday! Thinking of you today. ❤️`,
            (c) => `Happy birthday, ${c.name}! Hope you get properly spoiled.`,
            () => `Many happy returns! 🎉 Big hug from me.`,
        ],
        friend: [
            (c) => `Happy birthday, ${c.name}! 🎉 Hope you celebrate properly.`,
            (c) => `${c.age} today! 🎂 That calls for cake.`,
            () => `Happy birthday! We need to celebrate soon. 🍻`,
            (c) => `Happy birthday, old timer! 😄 You wear ${c.age} well.`,
        ],
        colleague: [
            (c) => `Happy birthday, ${c.name}! Hope you have a great celebration. 🎂`,
            () => `Many happy returns! Have a really good day.`,
            (c) => `Happy birthday, ${c.name}! 🎉`,
        ],
        other: [
            (c) => `Happy birthday, ${c.name}! 🎂`,
            (c) => `Happy ${ordinal(c.age)} birthday! 🎉`,
            () => `Many happy returns!`,
        ],
    },
    milestone: [
        (c) => `Happy ${ordinal(c.age)}, ${c.name}! 🎉 A round number deserves something extra.`,
        (c) => `${c.age}! 🎂 Congratulations, ${c.name} — big day today.`,
    ],
    anniversary: {
        partner: [
            () => `Happy anniversary ❤️ Thank you for everything.`,
            (c) => `Today is our day. Love you, ${c.name}. 💍`,
        ],
        family: [
            () => `Happy anniversary! 💍 Hope you celebrate in style.`,
            (c) => `Congratulations on the day, ${c.name}! Lovely to think about.`,
        ],
        friend: [
            () => `Happy anniversary! 💍 Cheers to you both.`,
            (c) => `Congratulations, ${c.name}! A good day to mark.`,
        ],
        colleague: [
            (c) => `Happy anniversary, ${c.name}! 💍`,
            () => `Congratulations on the day!`,
        ],
        other: [
            () => `Happy anniversary! 💍`,
            (c) => `Congratulations on the day, ${c.name}!`,
        ],
    },
    custom: [
        (c) => `Good luck with ${c.label.toLowerCase()}, ${c.name}! ${c.icon}`,
        (c) => `Thinking of you today, ${c.name}. ${c.icon}`,
        (c) => `${c.label} today — hope it goes well, ${c.name}!`,
        (c) => `Big day today, ${c.name}. Good luck! ${c.icon}`,
    ],
};

const notificationBodies: NotificationBodies = {
    dayOfBirthday: [
        "It's today. Don't be the one who forgets.",
        "The day is here — send something before breakfast is over.",
        "Today's the day. One tap and you're the hero.",
        "This is it. Two minutes and you've made someone happy.",
    ],
    dayOfGeneric: [
        "The day is today.",
        "It's today — worth a moment.",
        "Today is the day you meant to remember.",
    ],
    aheadBirthday: [
        "Still time to find something really good.",
        "Now, or in a panic on the day itself. Your call.",
        "Perfect moment to think about a gift.",
        "You have time. Use it while you've got it.",
    ],
    aheadGeneric: [
        "A little time to prepare something.",
        "Worth planning now.",
        "You're early — that's a good thing.",
    ],
};

export const en = {
    /** Passed to Intl for dates and month names. */
    locale: "en-GB",
    languageName: "English",

    common: {
        cancel: "Cancel",
        delete: "Delete",
        done: "Done",
        ok: "OK",
        edit: "Edit",
    },

    home: {
        specialDays: (count: number) => `${count} special days`,
        noneYet: "No reminders yet",
        emptyTitle: "No reminders yet",
        emptyBody: "Tap + to add your first\nbirthday or special day",
        importFromContacts: "Import from contacts",
        cards: "Cards",
        list: "List",
        year: "Year",
    },

    list: {
        searchPlaceholder: "Search names, types or notes",
        showing: (shown: number, total: number) => `${shown} of ${total}`,
        noMatchesTitle: "No matches",
        noMatchesBody: "Try another search term or clear the filters",
        thisMonth: "This month",
        all: "All",
        other: "Custom",
    },

    year: {
        empty: "Nothing this month",
        count: (n: number) => (n === 1 ? "1 date" : `${n} dates`),
    },

    form: {
        newTitle: "New reminder",
        editTitle: "Edit reminder",
        photoHint: "Tap to add a photo",
        addPhoto: "Add a photo",
        takePhoto: "Take a photo",
        chooseFromLibrary: "Choose from library",
        name: "Name",
        namePlaceholder: "e.g. Mum",
        type: "Type",
        custom: "Custom",
        customPlaceholder: "e.g. Exam, Moving day, Driving test",
        relationship: "Relationship (optional)",
        date: "Date",
        notifyMe: "Notify me",
        giftIdeas: "Gift ideas (optional)",
        giftIdeasPlaceholder: "Has been wanting…",
        create: "Save reminder",
        update: "Save changes",
        nameMissingTitle: "Name missing",
        nameMissingBody: "Enter a name before saving.",
        typeMissingTitle: "Type missing",
        typeMissingBody: "Give your custom type a name.",
    },

    detail: {
        sendGreeting: "Send greeting",
        date: "Date",
        comingUp: "Coming up",
        turning: "Turning",
        reminder: "Reminder",
        relationship: "Relationship",
        notSet: "Not set",
        giftIdeas: "Gift ideas",
        noNotes: "Nothing noted yet.",
        deleteTitle: "Delete this reminder?",
        deleteBody: "This cannot be undone.",
        deleteAction: "Delete reminder",
    },

    greetingSheet: {
        title: (name: string) => `Send a greeting to ${name}`,
        subtitle: "Pick a suggestion — you can edit it before sending",
        showOthers: "Show other suggestions",
    },

    settings: {
        title: "Settings",
        contacts: "Contacts",
        importBirthdays: "Import birthdays",
        importBirthdaysSub: "Pull birthdays from your contact list",
        language: "Language",
        languageSub: "Used for the app, greetings and notifications",
        backup: "Backup",
        exportTitle: "Export backup",
        exportSub: "Save all reminders as a JSON file",
        exportFailed: "Could not export",
        importTitle: "Import backup",
        importSub: "Restore from a previous file",
        importFailed: "Could not import",
        importDoneTitle: "Import complete",
        importDoneBody: (count: number) => `${count} reminders restored.`,
        photosNote: "Photos are not included in the backup — they stay on this device.",
        saveDialogTitle: "Save backup",
        sharingUnavailable: "Sharing is not available on this device.",
        notABackup: "That file does not look like a riMind backup.",
    },

    importScreen: {
        reading: "Reading contacts…",
        noAccess: "No access to contacts.",
        failedTitle: "Could not read contacts",
        foundNone: "No birthdays found in your contacts",
        found: (count: number) => `Found ${count} birthdays`,
        add: (count: number) => `Add ${count}`,
        adding: "Adding…",
        doneTitle: "Done",
        doneBody: (count: number) => `${count} birthdays added.`,
    },

    notFound: {
        title: "Not found",
        body: "This screen doesn't exist.",
        goHome: "Go to the home screen",
    },

    date: {
        today: "Today! 🎉",
        tomorrow: "Tomorrow",
        inDays: (days: number) => `In ${days} days`,
        soon: "SOON",
    },

    notify: {
        label: (days: number) => {
            if (days === 0) return "On the day";
            if (days === 1) return "1 day before";
            if (days === 7) return "1 week before";
            return `${days} days before`;
        },
    },

    types: {
        birthday: "Birthday",
        anniversary: "Anniversary",
        custom: "Special day",
    },

    relations: {
        partner: "Partner",
        family: "Family",
        friend: "Friend",
        colleague: "Colleague",
        other: "Other",
    },

    notificationTitles: {
        birthdayToday: (name: string, age: number) => `🎂 ${name} turns ${age} today`,
        birthdayAhead: (name: string, age: number, when: string) => `🎂 ${name} turns ${age} ${when}`,
        genericToday: (icon: string, name: string) => `${icon} ${name} — today`,
        genericAhead: (icon: string, name: string, when: string) => `${icon} ${name} — ${when}`,
        milestone: "Milestone!",
        milestoneAhead: (when: string) => `Milestone ${when}`,
        birthday: "Birthday",
        birthdayComingUp: "Birthday coming up",
        tomorrow: "tomorrow",
        inDays: (days: number) => `in ${days} days`,
        greetAction: "💬 Send greeting",
        snoozeAction: "Remind me tonight",
    },

    notificationBodies,
    greetings,
};

export type Translation = typeof en;
