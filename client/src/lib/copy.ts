import type { StatusFilter } from '@/lib/handoffDisplay'

/**
 * Turnover Log product voice — warm, plain, and easy to read.
 * Maintenance context without heavy jargon; short sentences for clarity.
 */
export const copy = {
  brand: {
    name: 'Turnover Log',
    tagline: 'A simple way to share shift notes between maintenance teams',
  },

  auth: {
    heroTitle: 'Keep your shift notes in one place',
    heroHighlight: 'for maintenance teams',
    heroBody:
      'Record what is open, what you worked on, and who should be informed — so the next shift can pick up smoothly.',
    highlights: [
      {
        title: 'Notes at shift change',
        text: 'Write down what is still open, what you finished, and anything waiting on parts or approval.',
      },
      {
        title: 'Supervisor updates',
        text: 'Your supervisor can see when a handoff is opened or closed, if you add their email at registration.',
      },
    ],
    accessLabel: 'Sign in',
    signInTitle: 'Welcome back',
    registerTitle: 'Create an account',
    signInDesc: 'Use the email and password you registered with.',
    registerDesc:
      'Include your supervisor’s email if you would like them to receive handoff updates.',
    displayName: 'Your name',
    displayNamePlaceholder: 'e.g. Alex M.',
    email: 'Email',
    password: 'Password',
    supervisorEmail: 'Supervisor email',
    submitSignIn: 'Go to your board',
    submitRegister: 'Create account',
    submitting: 'Signing in…',
    toggleToRegister: 'New here? Create an account',
    toggleToSignIn: 'Already have an account? Sign in',
    authFailed: 'We could not sign you in. Please check your email and password.',
  },

  shell: {
    defaultRole: 'Maintenance technician',
    boardSubtitle: 'Maintenance shift handoff',
    signOut: 'Sign out',
    localTime: 'Local time',
    zuluSuffix: 'UTC',
  },

  board: {
    sectionLabel: 'Your board',
    overviewTitle: 'Overview for this shift',
    linkLive: 'Connected',
    stats: {
      open: 'Open handoffs',
      highPriority: 'High priority',
      resolved: 'Resolved',
    },
    recordCount: (n: number) =>
      n === 1 ? 'Showing 1 item' : `Showing ${n} items`,
    listTitles: {
      Open: 'Open handoffs',
      Resolved: 'Resolved handoffs',
      All: 'All handoffs',
    } satisfies Record<StatusFilter, string>,
    loadFailed: 'We could not load your board. Please try again in a moment.',
    resolveFailed: 'We could not close that handoff. Please try again.',
  },

  handoff: {
    logNew: 'Add a handoff',
    logNewDesc: 'Share an update for the next shift and your supervisor.',
    assetTag: 'Equipment or aircraft ID',
    assetPlaceholder: 'N123AB, GEN-4, ACFT-01',
    priority: 'Priority',
    squawk: 'Notes for the next shift',
    squawkPlaceholder:
      'What you found, work completed, parts needed, or any follow-up for the next crew…',
    submit: 'Save handoff',
    submitting: 'Saving…',
    createFailed: 'We could not save that handoff. Please try again.',
    close: 'Mark as resolved',
    closing: 'Saving…',
    openedBy: (who: string, when: string) => `Opened by ${who} · ${when}`,
    closedBy: (who: string, when: string) => `Resolved by ${who} · ${when}`,
  },

  inbox: {
    title: 'Supervisor updates',
    description:
      'Handoffs from your team appear here when they list you as their supervisor.',
    refresh: 'Refresh',
    openBadge: (n: number) => (n === 1 ? '1 open' : `${n} open`),
    empty:
      'No updates yet. Team members need to add your email as their supervisor when they register.',
    loadFailed: 'We could not load supervisor updates. Please try again.',
    emailed: 'email sent',
    inAppOnly: 'in app only',
  },

  empty: {
    Open: {
      title: 'No open handoffs',
      body: 'When something needs to carry to the next shift, add a handoff here.',
    },
    Resolved: {
      title: 'No resolved handoffs yet',
      body: 'Handoffs you close will appear here for reference.',
    },
    All: {
      title: 'No handoffs yet',
      body: 'Add your first handoff when you are ready to share notes for this shift.',
    },
  } satisfies Record<StatusFilter, { title: string; body: string }>,
} as const
