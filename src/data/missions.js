export const missionDefs = [
  {
    id: "chat-bank-alert",
    title: "Phishy Bank Alert",
    summary: "Decode a suspicious banking message before it drains your wallet.",
    type: "chat",
    data: {
      messages: [
        { from: "npc", text: "Yo, your bank: urgent! Tap link to verify now 🔗" },
        { from: "npc", text: "Link: scam-bank.example" }
      ],
      choices: [
        { text: "Click the link", result: { deltaXP: -20, feedback: "Bruh 💀 that was a scam!", badge: "Careful Clicker" } },
        { text: "Check sender + open official app", result: { deltaXP: +30, feedback: "W move 🧠 Verified like a legend.", badge: "Link Detective" } }
      ]
    }
  },
  {
    id: "quiz-otp-panic",
    title: "OTP Panic Button",
    summary: "A friend wants your OTP. Stay calm and choose wisely.",
    type: "quiz",
    data: {
      question: "Your friend urgently needs your OTP for a payment. What's the safe move?",
      choices: [
        { text: "Share the OTP - it's my friend!", result: { deltaXP: -30, feedback: "Nah fam 🚫 OTPs are like toothbrushes - never share!", badge: "OTP Guardian" } },
        { text: "Call friend to verify + block number", result: { deltaXP: +40, feedback: "Gigachad energy 💪 Real friends never ask for OTPs.", badge: "Friend or Foe" } }
      ],
      tip: "One-Time Passwords (OTPs) should NEVER be shared, even with friends or family."
    }
  },
  {
    id: "interactive-upi",
    title: "UPI Scam Detector",
    summary: "Spot the red flags in a bogus UPI payment request.",
    type: "interactive",
    data: {
      scenario: "UPI Scam Detector",
      description: "Spot the red flags in this UPI payment request!",
      image: "scam-upi-example.png",
      flags: [
        { area: "sender", hint: "Check the sender's number" },
        { area: "amount", hint: "Unexpected money?" },
        { area: "urgency", hint: "Time pressure tactic" }
      ],
      choices: [
        { text: "Accept the money quick!", result: { deltaXP: -25, feedback: "They almost cooked you 💀 Free money is usually a trap!", badge: "UPI Warrior" } },
        { text: "Report as fraud + block", result: { deltaXP: +35, feedback: "Clutch ⚡ You spotted the scam pattern.", badge: "Scam Spotter" } }
      ],
      tip: "Legitimate contests don't ask you to pay or share sensitive info to claim prizes."
    }
  },
  {
    id: "dailyTip-2fa",
    title: "Double-Lock Your Accounts",
    summary: "Quick win: enable 2FA for an easy XP boost.",
    type: "dailyTip",
    data: {
      title: "Today's Security Tip",
      content: "Enable 2FA on all your accounts! It's like having a bouncer for your digital life 🔐",
      action: "Enable 2FA now",
      reward: { deltaXP: +15, badge: "Security Pro" }
    }
  },
  {
    id: "game-otp-rush",
    title: "Mini-Game: OTP Rush",
    summary: "Arcade reflex test — tap legit OTPs, dodge the bait.",
    type: "game",
    data: {
      reward: { deltaXP: +50, badge: "Email Inspector" }
    }
  },
  {
    id: "chat-job-offer",
    title: "Dream Job or Scam?",
    summary: "A stranger offers you double pay if you pay a deposit. What do you do?",
    type: "chat",
    data: {
      messages: [
        { from: "npc", text: "Congrats! We loved your profile. Pay ₹2,999 security deposit to join tomorrow." },
        { from: "npc", text: "Send UPI to hiring-fast-pay@upi." }
      ],
      choices: [
        { text: "Pay deposit to secure job", result: { deltaXP: -35, feedback: "Oof 😬 legit companies never charge joining fees." } },
        { text: "Ask for offer letter and company email", result: { deltaXP: +40, feedback: "Clutch! Verify domains + never pay deposits.", badge: "Job Watch" } }
      ]
    }
  },
  {
    id: "quiz-crypto-hype",
    title: "Crypto Hype Check",
    summary: "Inflated promises everywhere — pick the safe investment move.",
    type: "quiz",
    data: {
      question: "Telegram group promises 5x returns in 7 days if you join now. What's the play?",
      choices: [
        { text: "Join ASAP, stake everything", result: { deltaXP: -40, feedback: "That's a Ponzi invite 😵" } },
        { text: "Ignore hype, check SEBI-registered options", result: { deltaXP: +45, feedback: "Smart call! Research legit instruments.", badge: "Hype Buster" } }
      ],
      tip: "Guaranteed returns = guaranteed scam."
    }
  },
  {
    id: "interactive-marketplace",
    title: "Marketplace Showdown",
    summary: "Seller wants you to pay off-platform. Decide fast.",
    type: "interactive",
    data: {
      description: "A seller DMs you after you comment on a marketplace listing.",
      choices: [
        { text: "Pay via bank transfer for a discount", result: { deltaXP: -30, feedback: "Transfer = no buyer protection. Rip 😓" } },
        { text: "Use COD or platform escrow", result: { deltaXP: +35, feedback: "Safe move! Stay within official checkout.", badge: "Deal Detective" } }
      ],
      tip: "Keep chats + payments on the official app to stay covered."
    }
  },
  {
    id: "dailyTip-password",
    title: "Password Glow-Up",
    summary: "Upgrade one weak password with a manager and earn XP.",
    type: "dailyTip",
    data: {
      title: "Lock it down",
      content: "Swap one reused password for a strong unique one via a password manager.",
      action: "Open password manager",
      reward: { deltaXP: +20, badge: "Password Blacksmith" }
    }
  },
  {
    id: "chat-romance-wire",
    title: "Romance Red Flags",
    summary: "A 'partner' abroad keeps asking for gift cards.",
    type: "chat",
    data: {
      messages: [
        { from: "npc", text: "Babe, my card got blocked. Can you send 3 Amazon gift cards? I'll pay back soon." },
        { from: "npc", text: "Please hurry, I need it tonight 😢" }
      ],
      choices: [
        { text: "Buy the cards to help", result: { deltaXP: -40, feedback: "Classic romance scam. Protect the bag!" } },
        { text: "Refuse + block/report profile", result: { deltaXP: +45, feedback: "Heart Guard mode activated ❤️", badge: "Heart Guard" } }
      ]
    }
  }
];
