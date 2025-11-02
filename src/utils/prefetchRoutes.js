// Prefetch route chunks on hover to make navigation feel instant.
export function prefetchRoute(route) {
  switch (route) {
    case 'home': return import('../pages/Home')
    case 'missions': return import('../pages/Missions')
    case 'games': return import('../pages/Games')
    case 'minigame': return import('../pages/MiniGame')
    case 'password': return import('../pages/PasswordForge')
    case 'callshield': return import('../pages/CallShield')
    case 'invest': return import('../pages/InvestScam')
    case 'jobwatch': return import('../pages/JobWatch')
    case 'parcel': return import('../pages/ParcelPhish')
    case 'romance': return import('../pages/RomanceRedFlags')
    case 'dealdetective': return import('../pages/DealDetective')
  case 'profilelock': return import('../pages/ProfileLock')
  case 'inbox': return import('../pages/PhishingInbox')
    case 'leaderboard': return import('../pages/Leaderboard')
    case 'teams': return import('../pages/Teams')
    case 'profile': return import('../pages/Profile')
    case 'quiz': return import('../pages/QuizSpot')
    case 'qr': return import('../pages/QRScam')
    case 'linksniper': return import('../pages/LinkSniper')
    default: return Promise.resolve()
  }
}
