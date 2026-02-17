# Superpowers Skills System

This project uses the Superpowers skills system from [obra/superpowers](https://github.com/obra/superpowers) to provide structured workflows for common development tasks.

## Available Skills

| Skill | When to Use |
|-------|-------------|
| **brainstorming** | Before any creative work - creating features, building components, adding functionality |
| **using-superpowers** | At start of any conversation - establishes how to find and use skills |
| **systematic-debugging** | When encountering bugs, test failures, or unexpected behavior |
| **test-driven-development** | Before writing implementation code for any feature or bugfix |
| **writing-plans** | When you have requirements for a multi-step task, before touching code |
| **executing-plans** | When you have a written implementation plan to execute |
| **verification-before-completion** | Before claiming work is complete, committing, or creating PRs |
| **using-git-worktrees** | When starting feature work that needs isolation |
| **finishing-a-development-branch** | When implementation is complete and you need to integrate |
| **subagent-driven-development** | When executing implementation plans with independent tasks |
| **requesting-code-review** | After completing tasks or before merging |
| **receiving-code-review** | When receiving code review feedback |
| **dispatching-parallel-agents** | When facing 2+ independent tasks without shared state |
| **writing-skills** | When creating or editing skills |

## How Skills Work

Skills are automatically loaded from `.kilocode/skills/` directory. Each skill has a `SKILL.md` file with:
- YAML frontmatter (`name` and `description`)
- Detailed instructions for when and how to use the skill

## Core Principles

### The Iron Law of Skills

```
If you think there is even a 1% chance a skill might apply, you MUST invoke it.
```

Skills are not optional when they apply. They represent proven workflows that prevent common mistakes.

### Skill Priority

When multiple skills could apply:

1. **Process skills first** (brainstorming, debugging) - determine HOW to approach
2. **Implementation skills second** - guide execution

### Skill Types

- **Rigid** (TDD, debugging): Follow exactly. Don't adapt away discipline.
- **Flexible** (patterns): Adapt principles to context.

## Common Workflows

### Starting New Feature Work

1. Use **brainstorming** to explore requirements and design
2. Use **writing-plans** to create detailed implementation plan
3. Use **using-git-worktrees** to create isolated workspace
4. Use **executing-plans** or **subagent-driven-development** to implement
5. Use **verification-before-completion** before claiming done
6. Use **finishing-a-development-branch** to integrate

### Fixing a Bug

1. Use **systematic-debugging** to find root cause
2. Use **test-driven-development** to write failing test first
3. Implement fix
4. Use **verification-before-completion** to verify fix

### Receiving Code Review

1. Use **receiving-code-review** before implementing suggestions
2. Verify suggestions against codebase
3. Implement with technical rigor, not blind agreement

## Key Rules

### No Code Without Tests (TDD)

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before test? Delete it. Start over.

### No Fixes Without Root Cause (Debugging)

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed investigation, you cannot propose fixes.

### No Completion Without Verification

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

Run the command. Read the output. THEN claim the result.

## Red Flags - You're Rationalizing

If you catch yourself thinking:
- "This is just a simple question" → Check for skills
- "I need more context first" → Skill check comes FIRST
- "This doesn't need a formal skill" → If a skill exists, use it
- "I'll just do this one thing first" → Check BEFORE doing anything
- "The skill is overkill" → Simple things become complex

**All of these mean: STOP. Check for applicable skills.**
