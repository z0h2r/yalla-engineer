The ROI engineer - tech stack

## 💻 Suggested Tech Stack

### Option 1: **Astro Stack** (preferred for minimalism + performance)

| Layer                     | Tech                                                  |
| ------------------------- | ----------------------------------------------------- |
| **Frontend**              | Astro (content-focused, React components optional)    |
| **Markdown posts**        | `.mdx` or `.md` in `/src/content/posts`               |
| **Styling**               | Tailwind CSS                                          |
| **Components**            | Astro components or React (optional)                  |
| **Syntax highlighting**   | Shiki or PrismJS (Astro plugin)                       |
| **Image optimization**    | Astro `<Image />` or external CDN                     |
| **Embeds (YouTube, etc)** | Markdown plugins or Astro shortcodes                  |
| **SEO**                   | `@astrojs/seo` integration                            |
| **Deployment**            | **Vercel** (1-click deploy) or GitHub Actions + Pages |

> Bonus: Astro has an official **blog starter template** that fits most of your needs out of the box.

