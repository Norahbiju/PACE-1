# Filter Instructions

## Approved Behavior

- Filter panel background is `#fafafa`.
- The panel is open by default and scrollable.
- It can be collapsed and expanded.
- Active filter count must remain visible when filters are collapsed.
- Filters are disabled by default on first load.
- Every category and subcategory can expand/collapse.
- Filters are multi-select.
- Selecting a parent category selects all children.
- Deselecting a child updates parent state without forcing sibling selections.
- Selecting a child activates the parent without selecting sibling children.
- Skill ratings remain hidden until the user expands rating controls for a selected skill.
- Reset opens a confirmation dialog before clearing filters.

## Filter Categories

- Cloud
- SCM
- Containerization
- Build Management
- Continuous Integration
- Repo Management
- Testing & QA
- Deployment Automation
- Monitoring & Analysis
- Security
- Consulting
- Programming
- Backend
- Scripting
- Years of experience
- Location
- Certifications

## Styling Expectations

- Use compact filter rows, checkboxes, and expand buttons.
- Keep text readable in a dense dashboard layout.
- Do not hide active filter state.
- Avoid placing cards inside cards.
