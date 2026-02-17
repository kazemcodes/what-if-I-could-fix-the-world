// Constants for Story AI Studio

// ============================================================================
// Fantasy UI Theme Constants
// ============================================================================

export const FANTASY_COLORS = {
  // Backgrounds
  bgPrimary: '#1a1410',      // Dark wood
  bgSecondary: '#2d241c',    // Lighter wood
  bgCard: '#F4E4BC',         // Parchment
  bgCardDark: '#E8D4A8',     // Aged parchment
  
  // Text
  textPrimary: '#3D2914',    // Dark leather
  textSecondary: '#5D4934',  // Lighter leather
  textLight: '#F4E4BC',      // Light text for dark backgrounds
  textGold: '#D4AF37',       // Gold accent text
  
  // Accents
  accentGold: '#D4AF37',
  accentGoldHover: '#B8860B',
  accentRed: '#8B0000',
  accentGreen: '#228B22',
  accentBlue: '#4169E1',
  accentPurple: '#4B0082',
  
  // Borders
  borderGold: '#D4AF37',
  borderDark: '#3D2914',
  borderLight: 'rgba(212, 175, 55, 0.3)',
} as const;

export const FANTASY_FONTS = {
  heading: "'Cinzel', serif",
  headingDecorative: "'Cinzel Decorative', serif",
  body: "'Crimson Text', serif",
  ui: "'Cormorant Garamond', serif",
  mono: "'Fira Code', monospace",
} as const;

// ============================================================================
// Game Constants
// ============================================================================

export const ATTRIBUTE_MIN = 1;
export const ATTRIBUTE_MAX = 20;
export const ATTRIBUTE_DEFAULT = 10;

export const SKILL_MIN = 0;
export const SKILL_MAX = 100;

export const LEVEL_MIN = 1;
export const LEVEL_MAX = 100;

export const EXPERIENCE_PER_LEVEL = 1000;

export const DEFAULT_ATTRIBUTES = {
  strength: ATTRIBUTE_DEFAULT,
  dexterity: ATTRIBUTE_DEFAULT,
  intelligence: ATTRIBUTE_DEFAULT,
  wisdom: ATTRIBUTE_DEFAULT,
  charisma: ATTRIBUTE_DEFAULT,
  constitution: ATTRIBUTE_DEFAULT,
} as const;

// ============================================================================
// AI Provider Constants
// ============================================================================

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  LOCAL: 'local',
} as const;

export const OPENAI_MODELS = {
  GPT_4O: 'gpt-4o',
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_4: 'gpt-4',
  GPT_35_TURBO: 'gpt-3.5-turbo',
} as const;

export const ANTHROPIC_MODELS = {
  CLAUDE_3_OPUS: 'claude-3-opus',
  CLAUDE_3_SONNET: 'claude-3-sonnet',
  CLAUDE_3_HAIKU: 'claude-3-haiku',
} as const;

export const DEFAULT_AI_SETTINGS = {
  provider: AI_PROVIDERS.OPENAI,
  model: OPENAI_MODELS.GPT_4O,
  temperature: 0.7,
  maxTokens: 2000,
  responseStyle: 'narrative',
} as const;

// ============================================================================
// Power Categories
// ============================================================================

export const POWER_CATEGORIES = {
  PHYSICAL: 'physical',
  MENTAL: 'mental',
  ELEMENTAL: 'elemental',
  REALITY: 'reality',
  COSMIC: 'cosmic',
} as const;

export const POWER_CATEGORY_LABELS: Record<string, string> = {
  [POWER_CATEGORIES.PHYSICAL]: 'Physical Powers',
  [POWER_CATEGORIES.MENTAL]: 'Mental Powers',
  [POWER_CATEGORIES.ELEMENTAL]: 'Elemental Powers',
  [POWER_CATEGORIES.REALITY]: 'Reality Powers',
  [POWER_CATEGORIES.COSMIC]: 'Cosmic Powers',
};

// ============================================================================
// Item Rarity
// ============================================================================

export const ITEM_RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic',
} as const;

export const RARITY_COLORS: Record<string, string> = {
  [ITEM_RARITIES.COMMON]: '#808080',
  [ITEM_RARITIES.UNCOMMON]: '#1EFF00',
  [ITEM_RARITIES.RARE]: '#0070DD',
  [ITEM_RARITIES.EPIC]: '#A335EE',
  [ITEM_RARITIES.LEGENDARY]: '#FF8000',
  [ITEM_RARITIES.MYTHIC]: '#E6CC80',
};

// ============================================================================
// Session Status
// ============================================================================

export const SESSION_STATUSES = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const;

export const SESSION_STATUS_LABELS: Record<string, string> = {
  [SESSION_STATUSES.WAITING]: 'Waiting for Players',
  [SESSION_STATUSES.ACTIVE]: 'In Progress',
  [SESSION_STATUSES.PAUSED]: 'Paused',
  [SESSION_STATUSES.COMPLETED]: 'Completed',
};

// ============================================================================
// Container Status
// ============================================================================

export const CONTAINER_STATUSES = {
  CREATING: 'creating',
  RUNNING: 'running',
  IDLE: 'idle',
  SUSPENDED: 'suspended',
  STOPPED: 'stopped',
} as const;

// ============================================================================
// Container Tiers
// ============================================================================

export const CONTAINER_TIERS = {
  FREE: {
    name: 'Self-Hosted Free',
    cpuCores: 0.5,
    memoryMB: 512,
    storageGB: 1,
    price: 0,
  },
  BASIC: {
    name: 'Self-Hosted Basic',
    cpuCores: 1,
    memoryMB: 1024,
    storageGB: 5,
    price: 9.99,
  },
  PRO: {
    name: 'Self-Hosted Pro',
    cpuCores: 2,
    memoryMB: 2048,
    storageGB: 20,
    price: 19.99,
  },
  ENTERPRISE: {
    name: 'Self-Hosted Enterprise',
    cpuCores: 4,
    memoryMB: 4096,
    storageGB: 50,
    price: 39.99,
  },
  BYO: {
    name: 'BYO Server',
    cpuCores: -1, // Unlimited
    memoryMB: -1,
    storageGB: -1,
    price: 4.99,
  },
} as const;

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  
  // Stories
  STORIES: '/stories',
  STORY_BY_ID: (id: string) => `/stories/${id}`,
  STORY_CHARACTERS: (id: string) => `/stories/${id}/characters`,
  STORY_LOCATIONS: (id: string) => `/stories/${id}/locations`,
  
  // Sessions
  SESSIONS: '/sessions',
  SESSION_BY_ID: (id: string) => `/sessions/${id}`,
  SESSION_JOIN: (id: string) => `/sessions/${id}/join`,
  SESSION_LEAVE: (id: string) => `/sessions/${id}/leave`,
  SESSION_HISTORY: (id: string) => `/sessions/${id}/history`,
  
  // Media
  GENERATE_IMAGE: '/generate/image',
  GENERATE_AUDIO: '/generate/audio',
  MEDIA_BY_ID: (id: string) => `/media/${id}`,
  
  // Containers
  CONTAINERS: '/containers',
  CONTAINER_BY_ID: (id: string) => `/containers/${id}`,
  CONTAINER_INVITES: (id: string) => `/containers/${id}/invites`,
} as const;

// ============================================================================
// WebSocket Events
// ============================================================================

export const WS_EVENTS = {
  // Client -> Server
  SESSION_JOIN: 'session:join',
  SESSION_LEAVE: 'session:leave',
  GAME_ACTION: 'game:action',
  GAME_CHOICE: 'game:choice',
  PRESENCE_UPDATE: 'presence:update',
  
  // Server -> Client
  SESSION_STATE: 'session:state',
  STORY_CHUNK: 'story:chunk',
  STORY_COMPLETE: 'story:complete',
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
  ERROR: 'error',
} as const;

// ============================================================================
// Fantasy Symbols
// ============================================================================

export const FANTASY_SYMBOLS = {
  SWORD: '⚔️',
  SHIELD: '🛡️',
  SCROLL: '📜',
  STAR: '✦',
  DIAMOND: '◆',
  CROWN: '👑',
  FIRE: '🔥',
  HEART: '❤️',
  SKULL: '💀',
  BOOK: '📖',
  MAP: '🗺️',
  COMPASS: '🧭',
  CRYSTAL: '💎',
  POTION: '🧪',
  WAND: '🪄',
} as const;
