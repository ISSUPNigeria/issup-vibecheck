/**
 * Trigger Labels Utility
 *
 * Shared mapping of trigger IDs to display names used by both
 * the assessment components and the Results page.
 * Based on WHO ERS 2A/2B (External) and 3A/3B (Internal) forms.
 */

// 39 External Triggers (Situations & Settings)
export const EXTERNAL_TRIGGER_LABELS = {
  home_alone: 'Home alone',
  home_with_friends: 'Home with friends',
  friends_home: "Friend's home",
  parties: 'Parties',
  sporting_events: 'Sporting events',
  movies: 'Movies',
  bars_clubs: 'Bars/clubs',
  beach: 'Beach',
  concerts: 'Concerts',
  with_friends_who_use: 'With friends who use drugs',
  when_gaining_weight: 'When gaining weight',
  vacations_holidays: 'Vacations/holidays',
  when_raining: "When it's raining",
  before_date: 'Before a date',
  during_date: 'During a date',
  before_sexual_activities: 'Before sexual activities',
  during_sexual_activities: 'During sexual activities',
  after_sexual_activities: 'After sexual activities',
  before_work: 'Before work',
  when_carrying_money: 'When carrying money',
  after_going_past_dealers: "After going past dealer's residence",
  driving: 'Driving',
  liquor_store: 'Liquor store',
  during_work: 'During work',
  talking_on_phone: 'Talking on the phone',
  recovery_groups: 'Recovery groups',
  after_payday: 'After payday',
  before_going_out_dinner: 'Before going out to dinner',
  before_breakfast: 'Before breakfast',
  at_lunch_break: 'At lunch break',
  while_at_dinner: 'While at dinner',
  after_work: 'After work',
  after_passing_street_exit: 'After passing a particular street or exit',
  school: 'School',
  the_park: 'The park',
  in_neighborhood: 'In the neighborhood',
  weekends: 'Weekends',
  with_family_members: 'With family members',
  when_in_pain: 'When in pain',
};

// 36 Internal Triggers (Emotions & Feelings)
export const INTERNAL_TRIGGER_LABELS = {
  afraid: 'Afraid',
  frustrated: 'Frustrated',
  neglected: 'Neglected',
  angry: 'Angry',
  guilty: 'Guilty',
  nervous: 'Nervous',
  confident: 'Confident',
  happy: 'Happy',
  passionate: 'Passionate',
  criticized: 'Criticized',
  inadequate: 'Inadequate',
  pressured: 'Pressured',
  depressed: 'Depressed',
  insecure: 'Insecure',
  relaxed: 'Relaxed',
  embarrassed: 'Embarrassed',
  irritated: 'Irritated',
  sad: 'Sad',
  excited: 'Excited',
  jealous: 'Jealous',
  bored: 'Bored',
  exhausted: 'Exhausted',
  lonely: 'Lonely',
  envious: 'Envious',
  deprived: 'Deprived',
  humiliated: 'Humiliated',
  anxious: 'Anxious',
  aroused: 'Aroused',
  revengeful: 'Revengeful',
  worried: 'Worried',
  grieving: 'Grieving',
  resentful: 'Resentful',
  overwhelmed: 'Overwhelmed',
  misunderstood: 'Misunderstood',
  paranoid: 'Paranoid',
  hungry: 'Hungry',
};

// 4-level rating scale options
export const RATING_OPTIONS = [
  { value: 0, label: 'Never Use', color: 'green' },
  { value: 1, label: 'Almost Never', color: 'yellow' },
  { value: 2, label: 'Almost Always', color: 'orange' },
  { value: 3, label: 'Always Use', color: 'red' },
];

// Level display config for Results page
// Uses project's custom colors (orange, red, green) + standard Tailwind shades
// Icons for colorblind accessibility: warning triangle (high), exclamation circle (moderate), check circle (low/safe)
export const LEVEL_CONFIG = {
  always_use: {
    label: 'Avoid Totally',
    ratingLabel: 'Always Use',
    color: 'rose',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-700',
    badgeClass: 'bg-rose-600 text-white',
    icon: 'warning', // FaExclamationTriangle
  },
  almost_always: {
    label: 'High Risk',
    ratingLabel: 'Almost Always',
    color: 'orange',
    bgClass: 'bg-orange/10',
    borderClass: 'border-orange',
    textClass: 'text-orange',
    badgeClass: 'bg-orange text-white',
    icon: 'exclamation', // FaExclamationCircle
  },
  almost_never: {
    label: 'Low Risk',
    ratingLabel: 'Almost Never',
    color: 'amber',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-700',
    badgeClass: 'bg-amber-500 text-white',
    icon: 'info', // FaInfoCircle
  },
  never_use: {
    label: 'Safe',
    ratingLabel: 'Never Use',
    color: 'emerald',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-700',
    badgeClass: 'bg-emerald-600 text-white',
    icon: 'check', // FaCheckCircle
  },
};

/**
 * Get display name for a trigger ID.
 * Falls back to formatting the ID as a readable label.
 */
export function formatTriggerName(triggerId) {
  return (
    EXTERNAL_TRIGGER_LABELS[triggerId] ||
    INTERNAL_TRIGGER_LABELS[triggerId] ||
    triggerId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}