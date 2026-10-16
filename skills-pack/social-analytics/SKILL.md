---
name: social-analytics
description: Analyze Ahmed's social media performance from Metricool — top and bottom posts, reach, engagement, saves/shares, follower growth, best times and formats — and turn it into clear lessons and next actions. Use for weekly/monthly reviews, when the user asks "eh elly shaghal", "el reach nazel leh", or before planning the next content calendar.
---

# Social analytics

1. Pick the period and networks (default: last 30 days vs previous 30). Check brand/account via `getBrandSettings`.
2. Pull metrics with `getAnalyticsAvailableMetrics` → `getAnalyticsDataByMetrics`; posts and timing with `getBestTimeToPostByNetwork`.
3. Analyze:
   - Top 5 / bottom 5 posts by the metric that matters for the goal (saves & shares for education, comments for community, profile visits/link clicks for leads — reach alone is vanity).
   - Patterns: pillar, format, hook type, length, posting time.
   - Follower growth and where it came from.
   - Lead impact: DMs, link clicks, form sign-ups if the user shares CRM lead sources.
4. Output (Egyptian Arabic): 3-line summary, what to do more / less / test next, and 5 content ideas based on winners. One or two charts max (follow `dataviz`).

Don't overclaim causation from small numbers; say when data is too thin.
