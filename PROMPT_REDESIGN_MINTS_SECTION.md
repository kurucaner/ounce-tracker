# Prompt: Redesign Trusted Mints & Manufacturers Section

## Context

You are working on a Next.js/React TypeScript project for a precious metals price comparison website (OunceTracker). The Trusted Mints & Manufacturers section needs to be redesigned because the current implementation removed all descriptions and content, making it too minimal and losing important information.

## Current Problem

The section was redesigned to be "contentless" which removed:

- Detailed descriptions about each mint
- Specialties information
- Notable products lists
- Additional context about what makes each mint trusted

The user wants these descriptions back while maintaining a sophisticated, futuristic design aesthetic.

## Requirements

### 1. Content Requirements

**MUST INCLUDE for each mint:**

- Name (large, prominent)
- Country (with visual indicator)
- Purity percentage (99.99% or 99.9%+)
- **Description** (detailed paragraph explaining the mint's history, significance, and what makes them reputable)
- **Specialties** (3-4 key areas like "Refining", "Design Innovation", "Government Backing", etc.)
- **Notable Products** (list of 3-4 famous products like "Lady Fortuna Series", "Gold Maple Leaf", etc.)

**Mints to include:**

1. PAMP Suisse (Switzerland, 1977, 99.99%)
   - Description: One of the world's leading precious metals refiners, known for Lady Fortuna design and CertiPAMP technology
   - Specialties: Refining, Design Innovation, Certification
   - Products: Lady Fortuna Series, Fortuna Gold Bars, CertiPAMP Bars, InGold Series

2. Royal Canadian Mint (Canada, 1908, 99.99%)
   - Description: Crown corporation producing Maple Leaf coins with advanced security features, backed by Canadian government
   - Specialties: Government Backing, Maple Leaf Series, Security Features
   - Products: Gold Maple Leaf, Silver Maple Leaf, Platinum Maple Leaf, Palladium Maple Leaf

3. US Mint (United States, 1792, 99.99%)
   - Description: Official mint established by Congress, produces legal tender bullion coins including American Eagle and Buffalo series
   - Specialties: Legal Tender, Eagle Series, Buffalo Series
   - Products: American Gold Eagle, American Silver Eagle, American Buffalo, Platinum Eagle

4. Perth Mint (Australia, 1899, 99.99%)
   - Description: Australia's oldest operating mint, government enterprise known for innovative designs and Kangaroo/Lunar series
   - Specialties: Kangaroo Series, Lunar Series, Government Backing
   - Products: Australian Kangaroo, Australian Koala, Lunar Series, Perth Mint Bars

5. Valcambi (Switzerland, 1961, 99.99%)
   - Description: Premium Swiss refiner known for Combibar technology - bars that can be broken while maintaining certification
   - Specialties: Combibars, Innovation, Swiss Quality
   - Products: Combibar Technology, Valcambi Gold Bars, Silver Bars, Platinum Bars

6. Other Reputable Mints (Global, 99.9%+)
   - Description: Other trusted mints including Credit Suisse, Johnson Matthey, Heraeus, Argor-Heraeus
   - Specialties: Diversity, Global Recognition, Quality Standards
   - Products: Credit Suisse Bars, Johnson Matthey, Heraeus, Argor-Heraeus

### 2. Design Requirements

**Layout:**

- Alternating left-right layout (zigzag pattern) - one mint on left, next on right, etc.
- Generous spacing between cards (at least 64px-96px vertical spacing)
- Each card should have substantial space (minimum 500px height on desktop)
- Full-width cards that alternate alignment

**Visual Style:**

- Futuristic, sophisticated aesthetic
- Glassmorphism effects (backdrop blur, transparency)
- Gradient borders and backgrounds
- Subtle glow effects on hover
- Smooth animations and transitions
- Color-coded gradients for each mint (cyan, blue, purple, emerald, amber, slate)
- Modern typography hierarchy

**Content Presentation:**

- Large, bold mint name (text-4xl to text-6xl)
- Purity badge prominently displayed
- Country with visual indicator (glowing dot)
- Description text should be readable (text-base to text-lg, good line-height)
- Specialties as small badges/tags
- Notable products as a clean list
- All content should be visible without scrolling within each card

### 3. Technical Requirements

**File Location:**

- `apps/web/src/components/home/informative-sections.tsx`

**Component Structure:**

- Use React memo for performance
- Follow existing code patterns in the file
- Use Tailwind CSS classes
- Maintain TypeScript types
- Use existing shared components (Card, CardContent, CardHeader, CardTitle) where appropriate

**Code Style:**

- Named exports (not default exports)
- DisplayName for memo components
- Follow existing formatting and linting rules
- Use proper TypeScript interfaces

**Dependencies Available:**

- @shared package with Card components
- lucide-react for icons
- Tailwind CSS with custom theme
- React 18+

### 4. Design Inspiration

- Think Apple product pages - clean, spacious, premium
- Think luxury brand websites - sophisticated, elegant
- Modern fintech/tech company aesthetics
- Glassmorphism and neumorphism trends
- Futuristic but not overwhelming

### 5. What NOT to Do

- Don't remove descriptions or content
- Don't make cards too small
- Don't use a simple grid layout (must be alternating left-right)
- Don't make text too small or hard to read
- Don't overcomplicate with too many visual effects
- Don't use default exports

### 6. Expected Outcome

A beautiful, futuristic section that:

- Shows all mint information clearly
- Uses alternating left-right layout
- Has generous spacing and breathing room
- Maintains sophisticated visual design
- Is fully responsive (mobile-first)
- Performs well (memoized components)

## Current Code Context

The section is part of a larger `InformativeSections` component. The mint cards are currently using a `ContentlessMintCard` component that only shows name, country, and purity. You need to create a new component (or modify the existing one) that includes all the content requirements above.

The section header uses a `SectionHeader` component pattern that you can reference for consistency.

## Success Criteria

1. ✅ All descriptions are visible and readable
2. ✅ Specialties and notable products are displayed
3. ✅ Alternating left-right layout works correctly
4. ✅ Generous spacing between cards
5. ✅ Futuristic, sophisticated visual design
6. ✅ Fully responsive
7. ✅ No linting errors
8. ✅ TypeScript types are correct
