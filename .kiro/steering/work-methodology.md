---
title: Work Methodology & Decision Making
description: Professional workflow for analyzing, proposing, and implementing work
inclusion: always
---

# Work Methodology & Decision Making

## Core Principles

### 1. **Analyze Before Acting**
- NEVER implement immediately upon receiving a request
- ALWAYS analyze requirements, context, and trade-offs
- PRESENT options with clear pros and cons

### 2. **No Half-Assed Work**
- If you do it, do it right, do it completely, do it well
- Don't implement temporary solutions and abandon them
- Don't copy-paste code without understanding
- Don't skip validation, error handling, or edge cases

### 3. **Clear Prioritization**
- Assess impact: High/Medium/Low
- Assess effort: High/Medium/Low
- Prioritize: High Impact + Low Effort first
- Explain why you prioritize this way

---

## Workflow

### **Step 1: Understand**

When receiving a request:

1. **Read carefully** - Don't guess, don't assume
2. **Identify context:**
   - Is this a new feature or bug fix?
   - Which parts of the system are affected?
   - Does it relate to existing code/patterns?
3. **Identify constraints:**
   - Technical constraints (API, framework, performance)
   - Business constraints (deadline, scope, resources)
   - Design constraints (UX, accessibility, brand)

**Output:** Brief summary of requirements and context

---

### **Step 2: Analyze**

Analyze multiple aspects:

#### **A. Technical Analysis**
- Which files need to be read/changed?
- What's the current pattern/architecture?
- Are there dependencies to install/update?
- Any breaking changes?

#### **B. Impact Analysis**
- Impact on users: High/Medium/Low
- Impact on codebase: High/Medium/Low
- Risk level: High/Medium/Low

#### **C. Effort Estimation**
- Time: Quick (<30min) / Medium (30min-2h) / Large (>2h)
- Complexity: Simple / Medium / Complex
- Dependencies: None / Few / Many

**Output:** Impact vs Effort matrix

---

### **Step 3: Propose Solutions**

Present **2-4 options** with this format:

```markdown
## Option A: [Solution name]

**Approach:** [Brief description of how to do it]

**Pros:**
- ✅ [Advantage 1]
- ✅ [Advantage 2]

**Cons:**
- ❌ [Disadvantage 1]
- ❌ [Disadvantage 2]

**Effort:** [Low/Medium/High]
**Impact:** [Low/Medium/High]
**Risk:** [Low/Medium/High]

**Files affected:** [List of files]
```

#### **Prioritization framework:**

1. **Quick Wins** (High Impact + Low Effort) - Do immediately
2. **Strategic** (High Impact + High Effort) - Needs careful planning
3. **Fill-ins** (Low Impact + Low Effort) - Do when available
4. **Avoid** (Low Impact + High Effort) - Should not do

**Output:** List of options with clear recommendation

---

### **Step 4: Confirm**

Before implementing:

1. **Ask user to choose option** (if multiple valid choices exist)
2. **Confirm scope:**
   - How far should we go?
   - Do we need tests?
   - Do we need documentation?
3. **Confirm approach:**
   - Does the user agree with the approach?
   - Any concerns?

**NEVER** assume what the user wants - always ask clearly.

---

### **Step 5: Implement**

Once confirmed, implement following these principles:

#### **A. Code Quality**
- ✅ Follow project conventions (read `project-structure.md`)
- ✅ Type safety (TypeScript strict mode)
- ✅ Complete error handling
- ✅ Validation (client + server)
- ✅ Accessibility (ARIA labels, keyboard nav)

#### **B. Completeness**
- ✅ Happy path + edge cases
- ✅ Loading states
- ✅ Error states
- ✅ Empty states
- ✅ Success feedback (toast, redirect, etc.)

#### **C. Testing**
- ✅ Test manually before marking done
- ✅ Test edge cases
- ✅ Test error scenarios
- ✅ Test on multiple screen sizes (if UI)

#### **D. Documentation**
- ✅ Code comments for complex logic
- ✅ Update README if needed
- ✅ Update API docs if changed

**NEVER:**
- ❌ Implement halfway and abandon
- ❌ Skip error handling "for later"
- ❌ Hard-code values "temporarily"
- ❌ Copy-paste code without understanding
- ❌ Ignore TypeScript errors
- ❌ Ignore ESLint warnings

---

### **Step 6: Verify**

After implementing:

1. **Self-review:**
   - Is the code clean?
   - Does it follow conventions?
   - Are errors handled completely?
   - Has it been tested thoroughly?

2. **Checklist:**
   ```markdown
   - [ ] Code compiles without errors
   - [ ] No TypeScript errors
   - [ ] No ESLint warnings (or justified)
   - [ ] Tested happy path
   - [ ] Tested error cases
   - [ ] Tested edge cases
   - [ ] UI responsive (if UI)
   - [ ] Accessibility checked (if UI)
   - [ ] Documentation updated (if needed)
   ```

3. **Report:**
   - Summary of what was done
   - Files changed
   - How to test
   - Known limitations (if any)

---

## Anti-Patterns (Avoid)

### ❌ **Acting Without Thinking**
```
User: "Add delete button"
Agent: [Creates button immediately]
```

**Correct:**
```
User: "Add delete button"
Agent: "I need to understand better:
- Delete what? (soft delete or hard delete?)
- Need confirm dialog?
- Need permission check?
- How should errors be handled?

I propose 2 options:
A. Soft delete with confirm dialog (recommended)
B. Hard delete immediately (risky)

Which option do you prefer?"
```

---

### ❌ **Half-Assed Implementation**
```typescript
// ❌ BAD: Hard-code, no validation, no error handling
function deleteItem(id: number) {
  fetch(`/api/items/${id}`, { method: 'DELETE' });
  window.location.reload(); // Temporary page reload
}
```

**Correct:**
```typescript
// ✅ GOOD: Proper implementation
const deleteMutation = useMutation({
  mutationFn: (id: number) => deleteItem(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
    toast.success('Item deleted');
  },
  onError: (error: unknown) => {
    const err = error as { error?: { code?: string; message?: string } };
    switch (err?.error?.code) {
      case 'ITEM_NOT_FOUND':
        toast.error('Item not found');
        break;
      case 'ITEM_HAS_DEPENDENCIES':
        toast.error('Cannot delete item in use');
        break;
      default:
        toast.error(err?.error?.message || 'Delete failed');
    }
  },
});
```

---

### ❌ **Not Presenting Options**
```
User: "Improve error handling"
Agent: [Creates centralized error handler immediately]
```

**Correct:**
```
User: "Improve error handling"
Agent: "I see 3 approaches:

Option A: Centralized error handler
- Pros: DRY, consistent
- Cons: Less flexible, harder to customize per-case
- Effort: Medium

Option B: Per-mutation error handling
- Pros: Flexible, specific messages
- Cons: More code, need to maintain
- Effort: Low

Option C: Hybrid (centralized + override)
- Pros: Best of both worlds
- Cons: More complex
- Effort: High

Recommendation: Option B (per-mutation) because:
- Easier to maintain
- Clearer error messages
- Fits current codebase

Do you agree?"
```

---

### ❌ **Skipping Validation/Error Handling**
```typescript
// ❌ BAD
function createCategory(data: any) {
  return api.post('/categories', data);
}
```

**Correct:**
```typescript
// ✅ GOOD
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  active: z.boolean(),
});

function createCategory(data: CategoryFormData) {
  const validated = categorySchema.parse(data);
  return api.post('/categories', validated);
}
```

---

## Examples

### **Example 1: Feature Request**

**User:** "Add search for categories"

**Response:**
```markdown
I'll analyze the requirement:

## Context
- Current categories page is a tree view
- ~30-50 categories
- User needs to quickly find category by name/slug

## Options

### Option A: Client-side filter (Recommended)
**Approach:** Filter tree on client, highlight matches

**Pros:**
- ✅ Instant results (no API call)
- ✅ Works with existing data
- ✅ Simple implementation

**Cons:**
- ❌ Doesn't scale with >1000 categories
- ❌ Only searches loaded data

**Effort:** Low (30min)
**Impact:** Medium
**Files:** `app/dashboard/categories/page.tsx`

### Option B: Server-side search API
**Approach:** New API endpoint `/api/categories/search`

**Pros:**
- ✅ Scales well
- ✅ Can search all fields
- ✅ Can add fuzzy search

**Cons:**
- ❌ Requires backend changes
- ❌ Network latency
- ❌ More complex

**Effort:** High (2-3h)
**Impact:** Medium

## Recommendation
**Option A** because:
- Few categories (<100), client-side is sufficient
- Faster UX (no loading)
- No backend changes needed

Want me to implement Option A?
```

---

### **Example 2: Bug Fix**

**User:** "Slug validation not working"

**Response:**
```markdown
I'll investigate:

## Investigation
1. Read schema: `lib/schemas/categories.ts`
2. Read form: `app/dashboard/categories/page.tsx`
3. Test validation

## Findings
- Schema has regex: `/^[a-z0-9-]+$/`
- Form uses RHF with zodResolver
- Validation runs onSubmit, not realtime

## Root Cause
Validation only runs on submit, user doesn't see error immediately

## Options

### Option A: Add realtime validation
**Approach:** Validate onChange with `mode: 'onChange'`

**Pros:**
- ✅ Immediate feedback
- ✅ Better UX

**Cons:**
- ❌ Validates every keystroke (can be annoying)

### Option B: Validate onBlur
**Approach:** Validate when user leaves field

**Pros:**
- ✅ Good balance
- ✅ Not annoying

**Cons:**
- ❌ Slightly slower than onChange

## Recommendation
**Option B (onBlur)** because:
- Best UX balance
- Standard practice
- Not annoying

I will:
1. Add `mode: 'onBlur'` to useForm
2. Test with invalid slugs
3. Verify error messages display correctly

Proceed?
```

---

## Summary

### **DO:**
- ✅ Analyze before implementing
- ✅ Present 2-4 options with pros/cons
- ✅ Recommend best option with reasoning
- ✅ Confirm with user before implementing
- ✅ Implement completely, no half-assed work
- ✅ Test thoroughly before marking done
- ✅ Document changes

### **DON'T:**
- ❌ Act without thinking
- ❌ Implement halfway
- ❌ Skip error handling
- ❌ Skip validation
- ❌ Hard-code values
- ❌ Ignore TypeScript/ESLint errors
- ❌ Assume user intent

---

## Checklist for Each Task

```markdown
- [ ] Understood requirements clearly
- [ ] Analyzed impact & effort
- [ ] Presented 2-4 options
- [ ] Recommended best option
- [ ] Confirmed with user
- [ ] Implemented completely (no half-assed work)
- [ ] Handled errors
- [ ] Validated input
- [ ] Tested thoroughly
- [ ] Updated documentation (if needed)
- [ ] No TypeScript errors
- [ ] No ESLint warnings (or justified)
```

---

**Remember:** Quality over speed. Doing it right once is better than doing it over multiple times.
