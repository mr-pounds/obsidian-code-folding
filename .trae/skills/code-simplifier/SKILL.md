---
name: code-simplifier
description: Simplifies and refines code for clarity, consistency, and maintainability while preserving all functionality. Applies project-specific best practices to recently modified code. Use when: (1) Refining or improving existing code structure, (2) Applying coding standards to recently written code, (3) Simplifying complex code while maintaining functionality, (4) Enhancing code readability and maintainability.
---

# Code Simplifier

This skill provides specialized capabilities for simplifying and refining code to improve clarity, consistency, and maintainability while preserving exact functionality.

## When to Use This Skill

- Refining recently modified or newly written code
- Applying project coding standards (from Agent.md)
- Simplifying complex code structures
- Improving code readability without changing behavior
- Consolidating redundant logic or abstractions

## Core Principles

### Preserve Functionality
Never change what the code does—only how it does it. All original features, outputs, and behaviors must remain intact. Verify changes through testing or careful review.

### Apply Project Standards
Follow established coding standards from Agent.md:
- Use ES modules with proper import sorting and extensions
- Prefer `function` keyword over arrow functions
- Use explicit return type annotations for top-level functions
- Follow proper React component patterns with explicit Props types
- Use proper error handling patterns (avoid try/catch when possible)
- Maintain consistent naming conventions

### Enhance Clarity
Simplify code structure by:
- Reducing unnecessary complexity and nesting
- Eliminating redundant code and abstractions
- Improving readability through clear variable and function names
- Consolidating related logic
- Removing unnecessary comments that describe obvious code
- Avoiding nested ternary operators—prefer switch statements or if/else chains
- Choosing clarity over brevity—explicit code is better than overly compact code

### Maintain Balance
Avoid over-simplification that could:
- Reduce code clarity or maintainability
- Create overly clever solutions that are hard to understand
- Combine too many concerns into single functions or components
- Remove helpful abstractions that improve code organization
- Prioritize "fewer lines" over readability
- Make the code harder to debug or extend

## Refinement Process

1. **Identify Scope**: Focus on recently modified code sections in the current session
2. **Analyze**: Review code for opportunities to improve elegance and consistency
3. **Apply**: Implement refinements following project-specific best practices
4. **Verify**: Ensure all functionality remains unchanged
5. **Validate**: Confirm the refined code is simpler and more maintainable
6. **Document**: Note only significant changes that affect understanding

## Best Practices

### Code Simplification Guidelines

| Pattern      | Avoid                    | Prefer                         |
| ------------ | ------------------------ | ------------------------------ |
| Conditionals | Nested ternaries         | switch / if-else chains        |
| Functions    | Overly clever one-liners | Clear, explicit logic          |
| Variables    | Cryptic names            | Descriptive names              |
| Imports      | Unorganized imports      | Sorted imports with extensions |
| Components   | Implicit Props           | Explicit Props types           |

### Error Handling
- Prefer specific error handling over generic try/catch
- Let errors propagate when caller should handle them
- Use Result/Either patterns where appropriate

### React Components
- Explicit Props interfaces/types
- Descriptive component names
- Separate complex logic into hooks or utilities

## Examples

### Before (Complex)
```typescript
const getStatus = (user) => user?.isActive && !user?.isSuspended ? 'active' : user?.isPending ? 'pending' : 'inactive';
```

### After (Clear)
```typescript
function getStatus(user: User): 'active' | 'pending' | 'inactive' {
    if (!user.isActive || user.isSuspended) {
        return 'inactive';
    }
    if (user.isPending) {
        return 'pending';
    }
    return 'active';
}
```

## Limitations

- Only refines code that has been recently modified or touched in the current session
- Does not modify code outside the current session's changes unless explicitly instructed
- Preserves all functionality—does not refactor for performance or architectural changes
- Follows existing project standards—does not introduce new conventions

