import {
  PersonalityType, MascotTrigger, MascotMessage,
  EXPRESSION_MAP,
} from "./types";

// ═══════════════════════════════════════
// Quip Pools — ~4 per personality per trigger
// ═══════════════════════════════════════

const QUIPS: Record<PersonalityType, Record<MascotTrigger, string[]>> = {
  // ── DRILL SERGEANT ──
  "drill-sergeant": {
    "app-load": [
      "On your feet, recruit. Time to train.",
      "Another day, another chance to be less wrong.",
      "The forge waits for no one. Let's move.",
      "Fall in. We've got work to do.",
    ],
    "card-again": [
      "That answer was unsat. Hit it again.",
      "Wrong. The enemy doesn't wait. Again.",
      "Unacceptable. We drill until you get it right.",
      "Did you even read that card? Again!",
    ],
    "card-hard": [
      "You got there, but sloppy. Tighten it up.",
      "Barely passing doesn't cut it in the field.",
      "I've seen better. You will too. Next time.",
    ],
    "card-good": [
      "Solid answer. Don't let it go to your head.",
      "That's the standard. Maintain it.",
      "Acceptable. Keep that pace.",
    ],
    "card-easy": [
      "Clean execution. That's what I like to see.",
      "Perfect recall under pressure. Outstanding.",
      "That answer was textbook. Carry on.",
    ],
    "badge-earned": [
      "Badge earned: {badge}. Don't get soft now.",
      "You've earned {badge}. The real test is keeping it.",
      "{badge} — one more stripe on the uniform.",
    ],
    "streak-3": [
      "Three days straight. Discipline is forming.",
      "Streak of 3. Consistency wins wars.",
    ],
    "streak-7": [
      "Full week, no breaks. That's a soldier.",
      "7-day streak. You're earning my respect.",
    ],
    "speed-run-complete": [
      "{accuracy}% accuracy. {accuracy} or higher next time.",
      "{totalCards} cards in the heat of battle. Not bad.",
      "Speed run done. Your MTTR just dropped.",
    ],
    "tier-unlocked": [
      "Tier {newTier} unlocked. Harder material ahead.",
      "New tier. Don't celebrate — prepare.",
      "You've advanced. The real challenge starts now.",
    ],
    "session-complete": [
      "Session complete. Dismissed — for now.",
      "Good session. Report back tomorrow, same time.",
      "Training logged. Rest up, we go again tomorrow.",
    ],
    "idle-nudge": [
      "You're not on break, recruit.",
      "Standing around won't pass the interview.",
      "Cards won't review themselves. Move it.",
    ],
  },

  // ── CHEERLEADER ──
  "cheerleader": {
    "app-load": [
      "Hey!! You're here! Let's have an amazing study session!",
      "Welcome back, superstar! Ready to crush it?",
      "Yay, you showed up! That's already a win!",
      "Let's GOOO! Today is YOUR day!",
    ],
    "card-again": [
      "Oops! That's okay — every miss is a lesson!",
      "You'll get it next time, I believe in you!",
      "Shake it off! That card is gonna be SO easy next round!",
    ],
    "card-hard": [
      "You got it! A little rough, but you GOT it!",
      "Hey, hard-won knowledge sticks the longest!",
      "That was tough and you powered through!",
    ],
    "card-good": [
      "Nice one! You're on a roll!",
      "Look at you go! Nailing it!",
      "That's what I'm talking about!",
    ],
    "card-easy": [
      "YESSS!! You absolutely CRUSHED that one!",
      "Look at you, total knowledge beast!",
      "Easy peasy! You are ON FIRE today!",
      "PERFECT! That was INCREDIBLE!",
    ],
    "badge-earned": [
      "OMG you earned {badge}!! I'm SO proud!",
      "BADGE ALERT: {badge}!! You're amazing!",
      "{badge} unlocked!! Go you!!",
    ],
    "streak-3": [
      "THREE DAYS! You're building something great!",
      "Streak of 3!! Momentum is REAL!",
    ],
    "streak-7": [
      "A WHOLE WEEK! You're unstoppable!!",
      "7-day streak!! That is LEGENDARY!",
    ],
    "speed-run-complete": [
      "{accuracy}% accuracy! That's awesome!",
      "You powered through {totalCards} cards! Amazing!",
      "Speed run DONE! What a performance!",
    ],
    "tier-unlocked": [
      "NEW TIER UNLOCKED!! You leveled up!",
      "Tier {newTier}! Look how far you've come!",
      "You're advancing so fast! Tier {newTier}!!",
    ],
    "session-complete": [
      "Session done! You should be SO proud!",
      "Amazing work today! Every session counts!",
      "You showed up and delivered. That's a champion!",
    ],
    "idle-nudge": [
      "Hey! Let's keep the energy going!",
      "I miss you! Come review some cards!",
      "Just one more card? For me?",
    ],
  },

  // ── ZEN MASTER ──
  "zen-master": {
    "app-load": [
      "Breathe. The journey of mastery begins now.",
      "Welcome. Each moment of study is a gift.",
      "The path is the destination. Let us walk it.",
      "You are here. That is already enough.",
    ],
    "card-again": [
      "Mistakes are the soil where wisdom grows.",
      "The river does not judge the stone it shapes.",
      "Not knowing is the beginning of knowing.",
      "Let go of frustration. Return to the breath.",
    ],
    "card-hard": [
      "Struggle is the teacher's favorite student.",
      "A difficult truth learned is worth ten easy ones.",
      "The hard path strengthens the traveler.",
    ],
    "card-good": [
      "Steady as the mountain. Well done.",
      "Knowledge flows through you naturally now.",
      "Balance and understanding. This is the way.",
    ],
    "card-easy": [
      "Effortless mastery. The student becomes the teacher.",
      "Like water finding its path. Beautiful.",
      "When preparation meets the moment — clarity.",
    ],
    "badge-earned": [
      "{badge} — a milestone on an endless path.",
      "You have earned {badge}. Acknowledge it, then continue.",
      "The badge is not the goal. The growth was.",
    ],
    "streak-3": [
      "Three days of practice. The habit takes root.",
      "Consistency is the mother of mastery.",
    ],
    "streak-7": [
      "Seven days. The seed has become a sprout.",
      "A week of devotion. The universe notices.",
    ],
    "speed-run-complete": [
      "{accuracy}% — observe without judgment.",
      "Speed reveals what patience has built.",
      "{totalCards} cards, each a small meditation.",
    ],
    "tier-unlocked": [
      "A new level opens. The mountain grows taller.",
      "Tier {newTier} awaits. Approach with beginner's mind.",
    ],
    "session-complete": [
      "The session ends. The learning does not.",
      "Rest now. Tomorrow, we practice again.",
      "Each session is a stone in the temple of knowledge.",
    ],
    "idle-nudge": [
      "Stillness has its place. Is this that place?",
      "The cards await your attention, gently.",
      "Return when you are ready. Perhaps now?",
    ],
  },

  // ── SARCASTIC FRIEND ──
  "sarcastic-friend": {
    "app-load": [
      "Oh look who decided to study. Mark the calendar.",
      "Welcome back. The cards missed you. I didn't.",
      "You're here! Quick, nobody tell productivity Twitter.",
      "Ah, my favorite procrastinator returns.",
    ],
    "card-again": [
      "Oof. That card is going to haunt your dreams.",
      "Wrong answer. But hey, at least you're consistent.",
      "I'd say 'nice try' but... was it?",
      "The card said no. Loudly.",
    ],
    "card-hard": [
      "You got it! Barely. Like, by a hair.",
      "Technical pass. The judges are deliberating.",
      "That was the academic equivalent of a participation trophy.",
    ],
    "card-good": [
      "Hey, look at that. Competence!",
      "Solid answer. I'm mildly impressed.",
      "Not bad! Don't let it go to your head though.",
    ],
    "card-easy": [
      "Oh wow, you got one right. Alert the media.",
      "Show-off. That was annoyingly perfect.",
      "Okay fine, that was actually impressive.",
      "Nailed it. Even I have to admit that was clean.",
    ],
    "badge-earned": [
      "{badge}! Put it on your LinkedIn, obviously.",
      "Oh fancy, you got {badge}. Very distinguished.",
      "{badge} earned. Your mom would be proud. Maybe.",
    ],
    "streak-3": [
      "3 days? Is this... commitment? From YOU?",
      "Streak of 3. I barely recognize you.",
    ],
    "streak-7": [
      "A FULL WEEK?! Who are you and what did you do with the old you?",
      "7 days straight. I'm genuinely shocked.",
    ],
    "speed-run-complete": [
      "{accuracy}% accuracy. I've seen better. Also worse.",
      "{totalCards} cards speed-ran. Your fingers must be thrilled.",
      "Speed run done. Your keyboard needs a rest.",
    ],
    "tier-unlocked": [
      "Tier {newTier} unlocked. The hard stuff. Good luck, you'll need it.",
      "New tier! Things are about to get... interesting.",
    ],
    "session-complete": [
      "Session done! You can go back to doomscrolling now.",
      "Look at you, being all productive. Weird.",
      "Done! That wasn't so bad, was it? Don't answer that.",
    ],
    "idle-nudge": [
      "Hello? Anyone home? The cards are lonely.",
      "I can see you just sitting there, you know.",
      "This isn't a Netflix break. Cards. Now.",
    ],
  },
};

// ── Get a random quip ──

export function getQuip(
  personality: PersonalityType,
  trigger: MascotTrigger,
  meta?: Record<string, unknown>,
): MascotMessage {
  const pool = QUIPS[personality][trigger];
  let text = pool[Math.floor(Math.random() * pool.length)];

  // Replace {placeholders} from meta
  if (meta) {
    for (const [key, val] of Object.entries(meta)) {
      text = text.replaceAll(`{${key}}`, String(val));
    }
  }

  const expression = EXPRESSION_MAP[personality][trigger];
  const duration = Math.max(3000, text.length * 60);

  return { text, expression, duration };
}
