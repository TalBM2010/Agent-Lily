const STORAGE_KEY = "english-learner-onboarding";

export type OnboardingData = {
  childName: string;
  avatar: string;
};

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as OnboardingData;
    return Boolean(data.childName && data.avatar);
  } catch {
    return false;
  }
}

export function getOnboardingData(): OnboardingData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingData;
  } catch {
    return null;
  }
}

export function saveOnboardingData(data: OnboardingData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
