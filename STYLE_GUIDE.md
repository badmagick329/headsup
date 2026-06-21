# Heads Up Web App Style Guide

This app should feel crisp, simple, and intentional. The visual goal is not "friendly SaaS UI" or "template UI". It should feel more like a clean tool or a game screen: flat, direct, and readable from a distance.

## Core principles

- White background
- Black text by default
- Green as the primary accent colour
- White text only when it appears on a green background
- Sharp corners everywhere
- No card-heavy layout
- No pill badges, chips, or eyebrow labels
- No soft shadows or glossy effects
- Strong typography over decoration
- Spacing and alignment should create structure, not floating panels

## Overall look

The interface should be:

- flat
- high-contrast
- spacious
- typographically strong
- minimal
- practical rather than ornamental

It should not feel:

- bubbly
- overly rounded
- dashboard-like
- "AI slop"
- full of little containers inside bigger containers

## Colour direction

Base palette:

- Background: white
- Primary text: black
- Primary action colour: green
- Text on green: white
- Borders/dividers: black or a restrained light grey

Suggested green direction:

- Use a strong, grounded green rather than neon or pastel
- Think forest/emerald rather than lime/mint
- Keep it bold enough to anchor buttons and active states

Example starting point:

- Primary green: `#1f7a3d`
- Dark green hover/active: `#176030`
- Light green accent/background if ever needed: `#e8f3eb`
- Black: `#000000`
- White: `#ffffff`

These exact values can be tuned, but the feel should stay the same.

## Shape and surfaces

- Default to square corners
- Avoid rounded corners globally
- Avoid shadows unless there is a very strong reason
- Avoid floating cards as the main layout pattern
- Use borders, rules, whitespace, and type scale to separate sections

If a surface needs emphasis:

- prefer a border
- or a block of green
- or stronger type

Do not solve emphasis by wrapping everything in cards.

## Typography

Typography should carry a lot of the visual identity.

- Use a clean sans-serif
- Prefer bold, large type for important actions and game content
- Keep labels plain and direct
- Use scale and spacing instead of decorative captions or tiny uppercase eyebrow text

For the game prompt screen:

- The prompt should be the dominant element on the page
- It should be readable across the room
- It should be centered or otherwise clearly isolated
- Supporting UI should stay secondary

## Layout rules

- Prefer open layouts over boxed layouts
- Keep the number of visible elements low on each screen
- Use generous spacing
- Align elements cleanly to a grid
- Let sections breathe without surrounding each one with a container

Structure should come from:

- spacing
- alignment
- type hierarchy
- borders/dividers where needed

Not from:

- nested cards
- badges
- decorative panels

## Buttons and controls

- Buttons should be rectangular
- Buttons should feel solid and obvious
- Primary buttons use green background with white text
- Secondary buttons should usually be white with black text and a black or subtle border
- Avoid rounded icon-button-heavy UI unless it is clearly useful

For touch targets:

- Buttons must still be large and comfortable on mobile
- Large action areas are good
- Keep the forms visually simple

## Screen-specific direction

### Category list

- Simple list layout
- Clear category names
- Minimal decoration
- A strong primary action for starting or creating a category

### Round screen

- This should be the cleanest and boldest screen
- Huge prompt text
- Minimal supporting information
- Large rectangular action buttons
- No decorative frames around the prompt unless needed for clarity

### Results screen

- Strong headline for score
- Simple breakdown
- Clear next actions

### Import/create category screen

- Plain, practical input experience
- Large text area for pasted items
- Clear help text
- Avoid turning the form into a boxed "wizard"

## Tailwind implementation rules

When we build this in Tailwind, default toward:

- `bg-white`
- `text-black`
- `rounded-none`
- `shadow-none`
- strong green utility classes for primary actions
- borders used deliberately, not everywhere

Avoid making components that default to:

- rounded corners
- card wrappers
- badge/pill labels
- stacked decorative containers

## Design checkpoint

Before we accept a screen, it should pass this test:

- Does it look clean without looking generic?
- Is the structure coming from type and layout rather than cards?
- Are corners sharp?
- Is green used with purpose rather than everywhere?
- Would this still look good if almost all borders and containers disappeared?

If the answer is no, simplify it.
