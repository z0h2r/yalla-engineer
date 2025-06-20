# 🧠 PRD – Yalla Engineer Blog + Mini Apps Platform

## ✨ Product Title

**Yalla Engineer**  
_"Just another dev blog with nonsense" – Writing for myself, getting ROI from experiences by sharing them._

---

## 📌 Problem Statement

Most developer blogs try to be everything to everyone. They're optimized for SEO, filled with generic tutorials, or overly polished to the point of being inauthentic.

**The real need:** A personal space to articulate thoughts, capture lessons learned, and experiment with building useful tools – with the side benefit that others might find it useful too.

This isn't about becoming a "thought leader" or maximizing page views. It's about **getting ROI from experiences** by documenting them, and **learning by building** mini apps that solve real problems.

---

## 🧭 Goals

### Primary (Personal)
- **Articulate thinking** through writing – make sure I actually understand what I've learned
- **Capture lessons** from projects, mistakes, and discoveries before I forget them
- **Practice building** – use mini apps as learning vehicles for UI/UX, product thinking, and new tech
- **Low maintenance** – focus on content and building, not blog optimization

### Secondary (Public Benefit)
- **Share authentic experiences** – real problems, real solutions, mistakes included
- **Provide useful tools** – mini apps that solve actual problems people have
- **Document learning process** – show the "why I built this" and "what I learned" journey

---

## 🎯 Target Audience

### Primary: **Me** 
- Processing experiences and learning
- Building tools I actually want to use
- Keeping a record of what I figure out

### Secondary: **Other developers who appreciate honesty**
- People tired of over-polished dev content
- Developers who want to see real learning processes
- Anyone who might find the mini apps useful

---

## 🧱 Functional Requirements

### ✅ Blog Posts

Each **Post** includes:
- `title` (string)
- `slug` (auto-generated)
- `date` (date published)
- `summary` (brief description for cards)
- `content` (MDX with code blocks, no categories needed)
- `coverImage` (optional)
- **Dummy commit hash** (for developer aesthetic)

**Content Types:**
- **Learning posts** – "Here's what I figured out about X"
- **Tool builds** – "Why I built this mini app and what I learned"
- **Mistake documentation** – "How I messed up and what I learned"
- **Quick wins** – Short, practical discoveries

### ✅ Mini Apps

Interactive React components embedded in the blog:
- **Purpose**: Learning vehicles + actually useful tools
- **Integration**: Each app gets its own page with context about why it was built
- **Documentation**: "What I learned" section explaining technical and UX decisions
- **Iteration notes**: "Next version will..." to show continuous improvement mindset

**Current Apps:**
1. **Guitar Chord Finder** – Interactive chord diagrams
2. **Guitar Tuner** – Web Audio API reference tones  
3. **Recipe Scaler** – Smart recipe portion calculator

### ✅ Homepage Integration

- **Latest builds** (blog posts) with commit hashes
- **Mini Apps** section showcasing interactive tools
- **Personal intro** that sets honest expectations
- No categories, no SEO optimization, no newsletter signup

---

## 🖼 UX/UI Principles

### 1. **Authentic, Not Polished**
- Personal tone: "I'm mainly writing this for myself"
- Real commit hashes on blog posts (aesthetic + functional)
- "Ship it, fix it, yalla again" energy
- Mistakes and learning process included

### 2. **Developer-First Design**
- Terminal-style elements (commit hashes, monospace fonts)
- Code-focused color palette (blues, greens, purples)
- Clean but energetic (not corporate)
- Mobile responsive but desktop-optimized

### 3. **Interactive Learning**
- Mini apps demonstrate concepts in action
- Each tool explains its technical implementation
- Learning notes show decision-making process
- Iteration plans show continuous improvement

### 4. **Low Maintenance, High Signal**
- No comments system (too much overhead)
- No categories or tags (keep it simple)
- No analytics dashboard (focus on building, not metrics)
- Simple deployment and updates

---

## 🛠 Mini Apps Strategy

### **Learning Vehicles**
Each mini app serves multiple purposes:
- **Solve a real problem** I have
- **Practice new technology** (Web Audio API, React patterns, etc.)
- **Document the process** of building and learning
- **Iterate and improve** based on usage

### **Current Focus Areas**
- **Music tools** (guitar learning aids)
- **Productivity tools** (cooking, time management)
- **Developer utilities** (text processing, calculators)

### **Integration with Blog**
- Apps showcased on homepage
- Dedicated pages explaining why/how they were built
- Technical learning documented in detail
- Future iteration plans shared openly

---

## 🎯 Success Metrics (Personal)

### **For Writing:**
- Do I understand topics better after writing about them?
- Am I capturing lessons before I forget them?
- Is writing helping me process experiences?

### **For Mini Apps:**
- Am I learning new technical skills?
- Are the tools actually useful to me?
- Am I getting better at product thinking and UX?

### **For the Platform:**
- Is it easy to add new posts and apps?
- Am I maintaining the "yalla" energy and honest tone?
- Do I want to keep building on this?

---

## 🚀 Philosophy

**"Writing for myself - getting ROI from experiences by sharing them"**

This platform exists primarily for personal learning and growth. If others find it useful, that's a bonus. The focus is on:

- **Authentic documentation** of real learning
- **Building useful tools** while practicing new skills  
- **Honest reflection** on successes and failures
- **Continuous iteration** with a "ship it, fix it, yalla again" mindset

The goal isn't to become a "content creator" or "influencer" – it's to get more value out of experiences by articulating and sharing them, while building practical skills through mini app development.