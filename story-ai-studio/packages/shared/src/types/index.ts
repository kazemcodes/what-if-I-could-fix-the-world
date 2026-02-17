// Core domain types for Story AI Studio

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'fantasy';
  fontSize: 'small' | 'medium' | 'large';
  animationsEnabled: boolean;
  soundEnabled: boolean;
  language: string;
}

// ============================================================================
// Story Types
// ============================================================================

export interface Story {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  worldConfig: WorldConfig;
  aiSettings: AISettings;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldConfig {
  name: string;
  description: string;
  theme: FantasyTheme;
  era: FantasyEra;
  magicLevel: 'none' | 'low' | 'medium' | 'high';
  technologyLevel: 'primitive' | 'medieval' | 'renaissance' | 'steampunk';
  customRules: Record<string, unknown>;
}

export type FantasyTheme = 
  | 'high-fantasy'
  | 'dark-fantasy'
  | 'sword-and-sorcery'
  | 'epic-fantasy'
  | 'grimdark'
  | 'fairytale'
  | 'mythological';

export type FantasyEra =
  | 'ancient'
  | 'medieval'
  | 'renaissance'
  | 'age-of-sail'
  | 'custom';

export interface AISettings {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  responseStyle: ResponseStyle;
}

export type AIProvider = 'openai' | 'anthropic' | 'local';
export type ResponseStyle = 'narrative' | 'concise' | 'detailed' | 'dramatic';

// ============================================================================
// Character Types
// ============================================================================

export interface Character {
  id: string;
  storyId: string;
  name: string;
  title?: string;
  backstory: string;
  personality: Personality;
  attributes: Attributes;
  skills: SkillMap;
  imageUrl?: string;
  isPlayer: boolean;
  createdAt: Date;
}

export interface Personality {
  traits: string[];
  motivations: string[];
  fears: string[];
  speechStyle: string;
  quirks: string[];
}

export interface Attributes {
  strength: number;
  dexterity: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  constitution: number;
}

export interface SkillMap {
  [skillName: string]: number;
}

// ============================================================================
// Location Types
// ============================================================================

export interface Location {
  id: string;
  storyId: string;
  name: string;
  description: string;
  connections: string[];
  imageUrl?: string;
  atmosphere: Atmosphere;
  npcs: string[];
  items: string[];
}

export interface Atmosphere {
  lighting: 'bright' | 'dim' | 'dark' | 'magical';
  mood: 'peaceful' | 'tense' | 'mysterious' | 'dangerous' | 'chaotic';
  sounds: string[];
  smells: string[];
}

// ============================================================================
// Session Types
// ============================================================================

export interface GameSession {
  id: string;
  storyId: string;
  hostId: string;
  status: SessionStatus;
  currentState: SessionState;
  players: SessionPlayer[];
  createdAt: Date;
  updatedAt: Date;
}

export type SessionStatus = 'waiting' | 'active' | 'paused' | 'completed';

export interface SessionState {
  currentLocationId: string;
  activeQuests: string[];
  discoveredLocations: string[];
  knownNpcs: string[];
  inventory: InventoryItem[];
  storyProgress: number;
}

export interface SessionPlayer {
  id: string;
  sessionId: string;
  userId: string;
  characterId: string;
  playerState: PlayerState;
  joinedAt: Date;
}

export interface PlayerState {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  conditions: Condition[];
  activeEffects: Effect[];
}

export interface Condition {
  type: string;
  duration?: number;
  severity: 'minor' | 'moderate' | 'severe';
}

export interface Effect {
  type: string;
  source: string;
  duration?: number;
  modifiers: Record<string, number>;
}

// ============================================================================
// Story Event Types
// ============================================================================

export interface StoryEvent {
  id: string;
  sessionId: string;
  content: string;
  eventType: EventType;
  metadata: EventMetadata;
  createdAt: Date;
}

export type EventType = 
  | 'narration'
  | 'dialogue'
  | 'action'
  | 'combat'
  | 'discovery'
  | 'choice'
  | 'transition';

export interface EventMetadata {
  speaker?: string;
  targetId?: string;
  locationId?: string;
  choices?: Choice[];
  stateChanges?: StateChange[];
}

export interface Choice {
  id: string;
  text: string;
  consequences?: string[];
  requirements?: Requirement[];
}

export interface Requirement {
  type: 'attribute' | 'skill' | 'item' | 'quest';
  target: string;
  value: number | string;
  comparison: 'gte' | 'lte' | 'eq' | 'neq';
}

export interface StateChange {
  type: 'health' | 'mana' | 'item' | 'quest' | 'location' | 'relationship';
  action: 'add' | 'remove' | 'modify';
  target: string;
  value?: number | string | Record<string, unknown>;
}

// ============================================================================
// Inventory Types
// ============================================================================

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  rarity: ItemRarity;
  type: ItemType;
  properties: Record<string, unknown>;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc' | 'treasure';

// ============================================================================
// Player Avatar Types (Phase 6)
// ============================================================================

export interface PlayerAvatar {
  id: string;
  userId: string;
  name: string;
  title: string;
  backstory: Backstory;
  portrait?: string;
  attributes: Attributes;
  skills: SkillMap;
  level: number;
  experience: number;
  powers: Power[];
  powerPoints: number;
  companion: AICompanion;
  reputation: ReputationMap;
  relationships: RelationshipMap;
  achievements: Achievement[];
  legacy: LegacyData;
}

export interface Backstory {
  origin: string;
  definingMoments: string[];
  motivations: string[];
  fears: string[];
  relationships: string[];
}

export interface Power {
  id: string;
  name: string;
  category: PowerCategory;
  level: number;
  description: string;
  effects: PowerEffect[];
  cooldown?: number;
  costs: PowerCost[];
}

export type PowerCategory = 'physical' | 'mental' | 'elemental' | 'reality' | 'cosmic';

export interface PowerEffect {
  type: string;
  value: number | string;
  duration?: number;
  area?: 'single' | 'area' | 'self';
}

export interface PowerCost {
  type: 'mana' | 'health' | 'cooldown' | 'item';
  value: number;
}

export interface AICompanion {
  name: string;
  personality: PersonalityProfile;
  memory: LongTermMemory;
  tools: MCPTool[];
  relationship: CompanionBond;
  knowledge: KnowledgeBase;
}

export interface PersonalityProfile {
  traits: string[];
  speechStyle: string;
  humor: 'none' | 'subtle' | 'witty' | 'playful';
  formality: 'casual' | 'friendly' | 'formal';
}

export interface LongTermMemory {
  events: MemoryEvent[];
  preferences: Record<string, unknown>;
  lessons: string[];
}

export interface MemoryEvent {
  timestamp: Date;
  type: string;
  content: string;
  importance: number;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface CompanionBond {
  level: number;
  trust: number;
  experiences: number;
  unlockedAbilities: string[];
}

export interface KnowledgeBase {
  lore: Record<string, unknown>;
  quests: Record<string, unknown>;
  relationships: Record<string, unknown>;
  secrets: string[];
}

export interface ReputationMap {
  [factionOrLocation: string]: number;
}

export interface RelationshipMap {
  [npcId: string]: Relationship;
}

export interface Relationship {
  type: 'friend' | 'rival' | 'romantic' | 'mentor' | 'enemy' | 'neutral';
  level: number;
  history: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
  rarity: ItemRarity;
}

export interface LegacyData {
  legendPoints: number;
  heirlooms: string[];
  followers: string[];
  titles: string[];
}

// ============================================================================
// Container Types (Phase 7 - Self-Hosting)
// ============================================================================

export interface UserContainer {
  id: string;
  userId: string;
  status: ContainerStatus;
  resources: ContainerResources;
  config: ContainerConfig;
  invitedUsers: InvitedUser[];
  createdAt: Date;
  lastActive: Date;
}

export type ContainerStatus = 'creating' | 'running' | 'idle' | 'suspended' | 'stopped';

export interface ContainerResources {
  cpuCores: number;
  memoryMB: number;
  storageGB: number;
  bandwidthLimit?: number;
}

export interface ContainerConfig {
  aiProvider: AIProvider | 'custom';
  aiModel: string;
  customPrompts: Record<string, string>;
  moderationLevel: 'none' | 'basic' | 'strict';
  plugins: string[];
}

export interface InvitedUser {
  userId: string;
  permissions: InvitePermission;
  invitedAt: Date;
  lastActive: Date;
}

export interface InvitePermission {
  canCreateStories: boolean;
  canPlayGames: boolean;
  canInviteOthers: boolean;
  canModifySettings: boolean;
  maxSessionsPerDay: number;
}

export interface ContainerInvite {
  id: string;
  containerId: string;
  invitedBy: string;
  inviteCode: string;
  permissions: InvitePermission;
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
}
