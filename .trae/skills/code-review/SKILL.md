---
name: code-review
description: Automated code review for pull requests using multiple specialized agents with confidence-based scoring to filter false positives. Use when Agent needs to perform automated code reviews on GitHub pull requests, including Agent.md compliance checking, bug detection, historical context analysis, and confidence-based issue filtering.
license: Complete terms in LICENSE.txt
---

# Code Review Skill

## Overview

This skill provides automated code review capabilities for GitHub pull requests using a multi-agent approach with confidence-based scoring to minimize false positives. The system launches multiple specialized agents in parallel to independently audit changes from different perspectives.

## Workflow

### Step 1: Eligibility Check
Use a Haiku agent to check if the pull request:
- Is closed
- Is a draft
- Does not need a code review (automated PRs, trivial changes)
- Already has a code review from you

If any of these conditions are met, do not proceed.

### Step 2: Gather Agent.md Files
Use a Haiku agent to identify relevant Agent.md files:
- Root Agent.md file (if exists)
- Agent.md files in directories with modified files

### Step 3: PR Summary
Use a Haiku agent to view the pull request and return a summary of the changes.

### Step 4: Parallel Agent Review
Launch 5 parallel Sonnet agents to independently review the changes:

**Agent #1: Agent.md Compliance**
- Audit changes for compliance with Agent.md guidelines
- Note that Agent.md is guidance for Agent as it writes code, so not all instructions apply during code review

**Agent #2: Bug Detection**
- Perform shallow scan for obvious bugs in changes only
- Avoid reading extra context beyond the changes
- Focus on large bugs, avoid small issues and nitpicks
- Ignore likely false positives

**Agent #3: Historical Context**
- Read git blame and history of modified code
- Identify bugs in light of historical context

**Agent #4: Previous PR Analysis**
- Read previous pull requests that touched these files
- Check for comments that may apply to current PR

**Agent #5: Code Comments Compliance**
- Read code comments in modified files
- Ensure changes comply with guidance in comments

### Step 5: Confidence Scoring
For each issue found, launch a parallel Haiku agent to score confidence (0-100):

**Scoring Rubric:**
- **0**: Not confident at all. False positive or pre-existing issue
- **25**: Somewhat confident. Might be real but unverified
- **50**: Moderately confident. Real but minor/nitpick
- **75**: Highly confident. Real and important, or explicitly mentioned in Agent.md
- **100**: Absolutely certain. Definitely real, will happen frequently

For Agent.md issues: double-check that the guideline explicitly calls out the issue.

### Step 6: Filter Issues
Filter out any issues with a score less than 80. If no issues meet this threshold, do not proceed.

### Step 7: Final Eligibility Check
Repeat the eligibility check from Step 1 to ensure the PR is still eligible.

### Step 8: Post Review Comment
Use `gh` commands to comment on the pull request:
- Keep output brief
- Avoid emojis
- Link and cite relevant code, files, and URLs

## Comment Format

### When Issues Found:
```markdown
### Code review

Found 3 issues:

1. Missing error handling for OAuth callback (Agent.md says "Always handle OAuth errors")

https://github.com/owner/repo/blob/abc123.../src/auth.ts#L67-L72

2. Memory leak: OAuth state not cleaned up (bug due to missing cleanup in finally block)

https://github.com/owner/repo/blob/abc123.../src/auth.ts#L88-L95

3. Inconsistent naming pattern (src/conventions/Agent.md says "Use camelCase for functions")

https://github.com/owner/repo/blob/abc123.../src/utils.ts#L23-L28

🤖 Generated with [Agent Code](https://Agent.ai/code)

<sub>- If this code review was useful, please react with 👍. Otherwise, react with 👎.</sub>
```

### When No Issues Found:
```markdown
### Code review

No issues found. Checked for bugs and Agent.md compliance.

🤖 Generated with [Agent Code](https://Agent.ai/code)
```

## False Positive Filtering

Filter out these types of issues:
- Pre-existing issues not introduced in PR
- Code that looks like a bug but isn't
- Pedantic nitpicks that senior engineers wouldn't call out
- Issues that linters, typecheckers, or compilers would catch
- General code quality issues (unless explicitly required in Agent.md)
- Issues silenced by lint ignore comments
- Changes likely intentional or related to broader change
- Issues on lines not modified in the PR

## GitHub Integration

Use `gh` CLI for all GitHub interactions:
- Fetch PR details and diffs
- Read repository data
- Access git blame and history
- Post review comments

## Link Format Requirements

Code links must follow this exact format:
```
https://github.com/owner/repo/blob/[full-sha]/path/file.ext#L[start]-L[end]
```

Requirements:
- Use full SHA (not abbreviated)
- Use `#L` notation
- Include line range with at least 1 line of context
- Repo name must match the repository being reviewed

## Best Practices

### For Effective Reviews
- Maintain clear Agent.md files for better compliance checking
- Trust the 80+ confidence threshold - false positives are filtered
- Run on all non-trivial pull requests
- Review agent findings as a starting point for human review
- Update Agent.md based on recurring review patterns

### When to Use
- All pull requests with meaningful changes
- PRs touching critical code paths
- PRs from multiple contributors
- PRs where guideline compliance matters

### When Not to Use
- Closed or draft PRs (automatically skipped)
- Trivial automated PRs (automatically skipped)
- Urgent hotfixes requiring immediate merge
- PRs already reviewed (automatically skipped)

## Technical Architecture

### Agent Structure
- **2x Agent.md compliance agents**: Redundancy for guideline checks
- **1x bug detector**: Focused on obvious bugs in changes only
- **1x history analyzer**: Context from git blame and history
- **1x previous PR analyzer**: Learn from past reviews
- **1x code comments analyzer**: Ensure comment compliance

### Scoring System
- Each issue independently scored 0-100
- Scoring considers evidence strength and verification
- Threshold (default 80) filters low-confidence issues
- For Agent.md issues: verifies guideline explicitly mentions it

## Requirements

- Git repository with GitHub integration
- GitHub CLI (`gh`) installed and authenticated
- Agent.md files (optional but recommended for guideline checking)

## Troubleshooting

### Common Issues

**Review takes too long**: Normal for large PRs - agents run in parallel for thoroughness

**Too many false positives**: Default threshold is 80 (filters most false positives)

**No review comment posted**: Check if PR is closed, draft, trivial, already reviewed, or no issues ≥80

**Link formatting broken**: Ensure exact format with full SHA and proper line range notation

**GitHub CLI not working**: Install and authenticate `gh` CLI

## Configuration

### Adjusting Confidence Threshold
Modify the threshold in the workflow (default: 80). Change to preferred value (0-100).

### Customizing Review Focus
Add or modify agent tasks:
- Security-focused agents
- Performance analysis agents
- Accessibility checking agents
- Documentation quality checks

## Resources

This skill includes reference files for detailed guidance:

### references/code_review_workflow.md
Complete workflow documentation with examples and edge cases.

### references/false_positives.md
Detailed examples of false positives to avoid.

### references/gh_cli_commands.md
GitHub CLI command reference for code review operations.