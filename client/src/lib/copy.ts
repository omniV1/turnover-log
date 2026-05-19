import type { StatusFilter } from '@/lib/handoffDisplay'

/**
 * Turnover Log product voice — maintenance-native, plain, and readable.
 * Prefer short sentences; avoid generic SaaS phrasing ("dashboard", "leverage", etc.).
 */
export const copy = {
  brand: {
    name: 'Turnover Log',
    tagline: 'Shift handoff for line maintenance crews',
  },

  auth: {
    heroTitle: 'Hand the shift off on one board',
    heroHighlight: 'built for the line',
    heroBody:
      'Squawks, work performed, and who needs to know — captured before the next crew picks up the wrench.',
    highlights: [
      {
        title: 'Turnover at crew change',
        text: 'Log what is open, what you touched, and what is still waiting — while it is fresh.',
      },
      {
        title: 'Line lead on watch',
        text: 'Urgent items reach your lead’s inbox when a handoff opens or closes on their watch.',
      },
    ],
    accessLabel: 'Crew sign-in',
    signInTitle: 'Report to the hangar board',
    registerTitle: 'Join the maintenance crew',
    signInDesc: 'Use the email and password your shop issued for this board.',
    registerDesc:
      'Add your lead’s email so they see handoffs open and close on their watch.',
    displayName: 'Name on the board',
    displayNamePlaceholder: 'e.g. Alex M.',
    email: 'Work email',
    password: 'Password',
    supervisorEmail: 'Line lead email',
    submitSignIn: 'Open the hangar board',
    submitRegister: 'Create crew account',
    submitting: 'Checking you in…',
    toggleToRegister: 'First time here? Create an account',
    toggleToSignIn: 'Already on the roster? Sign in',
    demoFootnote:
      'Training accounts: demo@turnover.local and supervisor@turnover.local — password Demo1234!',
    authFailed: 'Could not sign you in. Check email and password.',
  },

  shell: {
    defaultRole: 'Maintenance technician',
    boardSubtitle: 'Line maintenance · hangar board',
    signOut: 'Leave the board',
    localTime: 'Local time',
    zuluSuffix: 'Zulu',
  },

  board: {
    sectionLabel: 'Hangar board',
    overviewTitle: 'This shift at a glance',
    linkLive: 'Hangar link live',
    stats: {
      open: 'Still on the board',
      highPriority: 'Needs attention now',
      resolved: 'Turned over this period',
    },
    recordCount: (n: number) =>
      n === 1 ? '1 entry on this view' : `${n} entries on this view`,
    listTitles: {
      Open: 'Still open',
      Resolved: 'Already turned over',
      All: 'Full shift log',
    } satisfies Record<StatusFilter, string>,
    loadFailed: 'The board could not load. Try again in a moment.',
    resolveFailed: 'Could not close that handoff. Try again.',
  },

  handoff: {
    logNew: 'Write a handoff',
    logNewDesc: 'Add an entry for the next crew and your line lead.',
    assetTag: 'Asset or tail number',
    assetPlaceholder: 'N123AB, GEN-4, ACFT-01',
    priority: 'How urgent',
    squawk: 'What the next crew must know',
    squawkPlaceholder:
      'Discrepancy, troubleshooting done, parts on order, MEL or deferral status…',
    submit: 'Post to the shift log',
    submitting: 'Posting…',
    createFailed: 'Could not post that handoff.',
    close: 'Mark turned over',
    closing: 'Closing…',
    openedBy: (who: string, when: string) => `Opened by ${who} · ${when}`,
    closedBy: (who: string, when: string) => `Turned over by ${who} · ${when}`,
  },

  inbox: {
    title: 'Line lead watch',
    description: 'Alerts when your crew opens or closes a handoff on your watch.',
    refresh: 'Update watch',
    openBadge: (n: number) => (n === 1 ? '1 open' : `${n} open`),
    empty:
      'Nothing on your watch yet. Crew must list your email as their line lead when they register.',
    loadFailed: 'Could not load your watch list.',
    emailed: 'emailed',
    inAppOnly: 'on the board only',
  },

  empty: {
    Open: {
      title: 'Board is clear',
      body: 'No open handoffs right now. Add one when you find something the next shift must carry.',
    },
    Resolved: {
      title: 'Nothing turned over yet',
      body: 'Closed handoffs show here so you can review what left the open list.',
    },
    All: {
      title: 'Shift log is blank',
      body: 'Post your first handoff to start the turnover trail for this shift.',
    },
  } satisfies Record<StatusFilter, { title: string; body: string }>,
} as const
