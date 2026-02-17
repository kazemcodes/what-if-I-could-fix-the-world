# Superpowers Skills System

This document defines the skills and workflows I follow for software development tasks.

## Core Principle

**If there's even a 1% chance a skill might apply, I MUST invoke it.**

Skills are mandatory workflows, not suggestions.

---

## Skill: using-superpowers

**Use when:** Starting any conversation - establishes how to find and use skills.

### The Rule

Invoke relevant or requested skills BEFORE any response or action. Even a 1% chance a skill might apply means I should check.

### Red Flags (Stop and Check for Skills)

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |

### Skill Priority

When multiple skills could apply:

1. **Process skills first** (brainstorming, debugging) - these determine HOW to approach the task
2. **Implementation skills second** - these guide execution

---

## Skill: brainstorming

**Use when:** Before any creative work - creating features, building components, adding functionality, or modifying behavior.

### The Process

**Understanding the idea:**
- Check out the current project state first (files, docs, recent commits)
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible
- Only one question per message
- Focus on understanding: purpose, constraints, success criteria

**Exploring approaches:**
- Propose 2-3 different approaches with trade-offs
- Present options conversationally with recommendation and reasoning
- Lead with recommended option and explain why

**Presenting the design:**
- Once I understand what we're building, present the design
- Break it into sections of 200-300 words
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing
- Be ready to go back and clarify if something doesn't make sense

### After the Design

**Documentation:**
- Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Commit the design document to git

**Implementation (if continuing):**
- Ask: "Ready to set up for implementation?"
- Use using-git-worktrees to create isolated workspace
- Use writing-plans to create detailed implementation plan

### Key Principles

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design in sections, validate each

---

## Skill: writing-plans

**Use when:** I have a spec or requirements for a multi-step task, before touching code.

### Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything: which files to touch for each task, code, testing, docs, how to test. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

### Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

### Task Structure

Each task should include:
- **Files:** Exact paths to create, modify, and test files
- **Steps:** Numbered steps with exact code and commands
- **Verification:** How to verify each step works

### Remember

- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits

---

## Skill: test-driven-development

**Use when:** Implementing any feature or bugfix, before writing implementation code.

### The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it. Start over.

### Red-Green-Refactor

1. **RED** - Write one minimal test showing what should happen
2. **Verify RED** - Run test, confirm it fails for the right reason (MANDATORY)
3. **GREEN** - Write simplest code to pass the test
4. **Verify GREEN** - Run test, confirm it passes (MANDATORY)
5. **REFACTOR** - Clean up after green only
6. **Repeat** - Next failing test for next feature

### Good Tests

| Quality | Good | Bad |
|---------|------|-----|
| **Minimal** | One thing. "and" in name? Split it. | `test('validates email and domain and whitespace')` |
| **Clear** | Name describes behavior | `test('test1')` |
| **Shows intent** | Demonstrates desired API | Obscures what code should do |

### Red Flags - STOP and Start Over

- Code before test
- Test after implementation
- Test passes immediately
- Can't explain why test failed
- Tests added "later"
- Rationalizing "just this once"

**All of these mean: Delete code. Start over with TDD.**

### Verification Checklist

Before marking work complete:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for expected reason
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output pristine (no errors, warnings)
- [ ] Tests use real code (mocks only if unavoidable)
- [ ] Edge cases and errors covered

---

## Skill: systematic-debugging

**Use when:** Encountering any bug, test failure, or unexpected behavior, before proposing fixes.

### The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If I haven't completed Phase 1, I cannot propose fixes.

### The Four Phases

#### Phase 1: Root Cause Investigation

1. **Read Error Messages Carefully** - Don't skip past errors or warnings
2. **Reproduce Consistently** - Can I trigger it reliably?
3. **Check Recent Changes** - Git diff, recent commits
4. **Gather Evidence in Multi-Component Systems** - Add diagnostic instrumentation at each component boundary
5. **Trace Data Flow** - Where does bad value originate?

#### Phase 2: Pattern Analysis

1. Find working examples in same codebase
2. Compare against reference implementations
3. Identify differences between working and broken
4. Understand dependencies

#### Phase 3: Hypothesis and Testing

1. Form single hypothesis: "I think X is the root cause because Y"
2. Test minimally - smallest possible change
3. Verify before continuing
4. When I don't know: Say "I don't understand X"

#### Phase 4: Implementation

1. Create failing test case (use TDD skill)
2. Implement single fix
3. Verify fix
4. If fix doesn't work: STOP, count attempts, if ≥3 question architecture

### Red Flags - STOP and Follow Process

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- Proposing solutions before tracing data flow
- "One more fix attempt" (when already tried 2+)

---

## Skill: verification-before-completion

**Use when:** About to claim work is complete, fixed, or passing, before committing or creating PRs.

### The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If I haven't run the verification command in this message, I cannot claim it passes.

### The Gate Function

```
BEFORE claiming any status:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim
```

### Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!")
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification

### Key Patterns

**Tests:**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Build:**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed"
```

---

## Skill: using-git-worktrees

**Use when:** After design approval, before implementation.

### Directory Priority

1. Check for existing: `.worktrees/` (preferred) or `worktrees/`
2. Check project config for preference
3. Ask user if neither exists

### Safety Verification

**MUST verify directory is ignored before creating worktree:**

```bash
git check-ignore -q .worktrees
```

If NOT ignored: Add to .gitignore and commit before proceeding.

### Creation Steps

1. Detect project name
2. Create worktree with new branch
3. Run project setup (npm install, cargo build, etc.)
4. Verify clean test baseline
5. Report location

---

## Skill: finishing-a-development-branch

**Use when:** Implementation is complete, all tests pass, and need to decide how to integrate the work.

### The Process

1. **Verify Tests** - Run test suite, stop if failing
2. **Determine Base Branch** - main or master
3. **Present Options:**
   1. Merge back to base-branch locally
   2. Push and create a Pull Request
   3. Keep the branch as-is
   4. Discard this work
4. **Execute Choice** - Follow user's selection
5. **Cleanup Worktree** - For options 1, 2, and 4

---

## Skill: requesting-code-review

**Use when:** Completing tasks, implementing major features, or before merging.

### When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

### How to Request

1. Get git SHAs (base and head)
2. Review changes between commits
3. Check for: test coverage, code quality, spec compliance
4. Act on feedback appropriately

---

## Skill: executing-plans

**Use when:** I have a written implementation plan to execute.

### The Process

1. **Load and Review Plan** - Read plan file, review critically
2. **Execute Batch** - Default: First 3 tasks
3. **Report** - Show what was implemented, verification output
4. **Continue** - Based on feedback, execute next batch
5. **Complete** - Use finishing-a-development-branch skill

### When to Stop

- Hit a blocker mid-batch
- Plan has critical gaps
- Don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

---

## Skill: subagent-driven-development

**Use when:** Executing implementation plans with independent tasks in the current session.

### The Process

For each task:
1. Dispatch implementer with full task text + context
2. Answer any questions from implementer
3. Implementer implements, tests, commits, self-reviews
4. Dispatch spec reviewer - confirm code matches spec
5. Dispatch code quality reviewer - check code quality
6. Fix any issues found
7. Mark task complete

### Red Flags

- Start implementation on main/master without explicit consent
- Skip reviews
- Proceed with unfixed issues
- Accept "close enough" on spec compliance

---

## Philosophy

- **Test-Driven Development** - Write tests first, always
- **Systematic over ad-hoc** - Process over guessing
- **Complexity reduction** - Simplicity as primary goal
- **Evidence over claims** - Verify before declaring success
- **YAGNI** - You Aren't Gonna Need It
- **DRY** - Don't Repeat Yourself

---

## Quick Reference: Which Skill to Use?

| Situation | Skill |
|-----------|-------|
| Starting any task | using-superpowers |
| Building something new | brainstorming |
| Have requirements, need plan | writing-plans |
| Writing code | test-driven-development |
| Found a bug | systematic-debugging |
| About to say "done" | verification-before-completion |
| Ready to implement | using-git-worktrees |
| Work complete | finishing-a-development-branch |
| Need review | requesting-code-review |
| Have a plan to execute | executing-plans or subagent-driven-development |
