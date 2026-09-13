import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely (prevent duplicate initializeApp)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Configure Google Auth Provider with Google Calendar scopes
export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

const provider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach((scope) => provider.addScope(scope));

// Flags & in-memory token cache (never stored in localStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  htmlLink?: string;
  status?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
}

export interface GoogleCalendarListEntry {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
}

/**
 * Initialize Auth State Listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If we have a user from session but token is not in memory, user might need to re-authenticate for fresh token
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Perform Google Sign-In with Calendar Scopes via Popup
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter token de acesso do Google OAuth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Google Calendar REST API Helper
 */
async function calendarFetch(endpoint: string, options: RequestInit = {}) {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Usuário não autenticado no Google Calendar. Conecte sua conta primeiro.');
  }

  const res = await fetch(`https://www.googleapis.com/calendar/v3/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    let parsedMessage = errorText;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error?.message) {
        parsedMessage = parsed.error.message;
      }
    } catch {
      // ignore
    }
    throw new Error(`Erro na API do Google Calendar (${res.status}): ${parsedMessage}`);
  }

  if (res.status === 204) {
    return null;
  }

  return await res.json();
}

/**
 * List primary calendar events with optional time filters
 */
export const listCalendarEvents = async (
  timeMin?: string,
  timeMax?: string,
  maxResults = 50
): Promise<GoogleCalendarEvent[]> => {
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: maxResults.toString(),
  });

  if (timeMin) params.append('timeMin', timeMin);
  if (timeMax) params.append('timeMax', timeMax);

  const data = await calendarFetch(`calendars/primary/events?${params.toString()}`);
  return data?.items || [];
};

/**
 * List user's Google Calendars
 */
export const listUserCalendars = async (): Promise<GoogleCalendarListEntry[]> => {
  const data = await calendarFetch('users/me/calendarList');
  return data?.items || [];
};

/**
 * Create a new event on Google Calendar
 */
export const createCalendarEvent = async (event: {
  summary: string;
  description?: string;
  startDateTime: string; // ISO String
  endDateTime: string;   // ISO String
  location?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
}): Promise<GoogleCalendarEvent> => {
  const body = {
    summary: event.summary,
    description: event.description,
    start: {
      dateTime: event.startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    location: event.location,
    attendees: event.attendees,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 60 },
      ],
    },
  };

  return await calendarFetch('calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * Update an existing event on Google Calendar
 */
export const updateCalendarEvent = async (
  eventId: string,
  event: {
    summary?: string;
    description?: string;
    startDateTime?: string;
    endDateTime?: string;
    location?: string;
    status?: string;
  }
): Promise<GoogleCalendarEvent> => {
  const body: any = {};
  if (event.summary) body.summary = event.summary;
  if (event.description) body.description = event.description;
  if (event.location) body.location = event.location;
  if (event.status) body.status = event.status;

  if (event.startDateTime) {
    body.start = {
      dateTime: event.startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  if (event.endDateTime) {
    body.end = {
      dateTime: event.endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  return await calendarFetch(`calendars/primary/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
};

/**
 * Delete an event from Google Calendar
 */
export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
  await calendarFetch(`calendars/primary/events/${eventId}`, {
    method: 'DELETE',
  });
};
