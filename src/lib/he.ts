/** All Hebrew UI strings — single source of truth for the Hebrew-only UI. */
export const he = {
  onboarding: {
    nameStep: {
      title: "שלום",
      subtitle: "איך קוראים לך",
      placeholder: "השם שלי",
      next: "יאללה",
    },
    avatarStep: {
      title: "בחרי אווטאר",
      subtitle: "מי ילווה אותך",
      start: "בואי נתחיל",
    },
  },
  topics: {
    greeting: (name: string, avatar: string) => `${avatar} היי ${name}`,
    subtitle: "מה נלמד היום",
    startButton: "יאללה",
    startButtonDisabled: "בחרי נושא",
  },
  lesson: {
    noTopic: "לא נבחר נושא. חזרי ובחרי אחד",
    startButton: "דברי עם לילי",
    startButtonLoading: "לילי מתכוננת",
    error: "אופס, בואי ננסה שוב",
    you: "את",
    lily: "לילי",
    holdToTalk: "לחצי לדבר",
    textOnly: "קראי מה לילי כתבה",
    topicLabels: {
      animals: "חיות",
      colors: "צבעים",
      family: "משפחה",
      food: "אוכל",
      numbers: "מספרים",
      body: "גוף",
      clothes: "בגדים",
      weather: "מזג אוויר",
      school: "בית ספר",
      toys: "צעצועים",
    } as Record<string, string>,
  },
  loader: {
    text: "לילי חושבת",
  },
  avatar: {
    name: "לילי",
    stateLabels: {
      idle: "",
      listening: "אני מקשיבה",
      thinking: "רגע, אני חושבת",
      speaking: "",
    } as Record<string, string>,
  },
  mic: {
    startRecording: "התחילי הקלטה",
    stopRecording: "עצרי הקלטה",
  },
} as const;
