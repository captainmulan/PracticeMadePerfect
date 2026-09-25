# NZMigrationMM Mini Web App

This folder contains a local archive app for curated New Zealand migration posts. The app is intentionally data-first: the canonical content lives in the dataset, counts are generated from that dataset, and the article reading experience stays inside the mini web app instead of bouncing users away to Facebook.

The current structure supports two main content sources:

- Kiwi Land posts for general NZ migration guidance
- Crystal posts for job-search, interview, visa, and work-readiness guidance

The archive is meant to remain easy to extend without hard-coding new posts into HTML pages.

## Purpose

- Store original posts locally for offline reading
- Keep source links visible for verification
- Show article text inside the mini web app itself
- Generate totals from canonical data instead of hard-coded numbers
- Keep category and author filters synced to the actual dataset
- Make future content additions consistent and maintainable

## Folder structure

- `data/collection.json` - source-of-truth dataset for all collected records
- `_nzmm.js` - shared logic for loading, searching, and rendering collection records
- `001-Original-Post-Groups.html` - directory page with the process banner and searchable article list
- `article.html` - single detail page that renders a selected record using `?id=`
- `_source-posts-*.js` - source extraction and content-review files
- Styling files such as `_nzmm-home.css`, `_nzmm-theme.css`, and `_nzmm-tree.css` - app styling

## Current app model

The app uses a data-first model:

1. `data/collection.json` stores all canonical article entries
2. `_nzmm.js` fetches the collection and builds the directory and detail view

This means new content should be added in the dataset instead of being pasted directly into multiple HTML pages.

## Session summary

This mini app is a local archive for NZ migration content, built to keep original posts readable inside the app itself rather than sending users off to Facebook or other external pages.

The key idea is simple:

- the canonical content lives in `data/posts.js`
- the app reads from that dataset at runtime
- category totals, author filters, and article detail pages are generated from the same source of truth
- the post text stays local and faithful to the original author content

The app was corrected to ensure:

- post counts come from the actual dataset, not hard-coded HTML values
- author filters match real post IDs and category membership
- Crystal and Kiwi Land totals stay aligned with the stored posts
- local post detail pages open inside the mini app instead of redirecting to external social media pages
- original author Facebook text is preserved locally without synthetic English summaries or rewritten explanations

## Verified state

As of the current dataset, the archive contains:

- 43 total posts
- 21 Crystal posts
- 22 Kiwi Land posts
- 0 missing IDs in category mappings

This is the reason Crystal now shows 20+ results in the app and filters stay aligned with the actual content.

## How to add a new post

Add each article under `window.NZMM_POSTS` in `data/posts.js`.

```js
window.NZMM_POSTS = {
  "authorPostKey": {
    title: "Post title",
    url: "https://www.facebook.com/...",
    text: "Full local copy of the original post text"
  },
  "anotherPostKey": {
    title: "Another title",
    url: "https://www.facebook.com/...",
    text: "More local text..."
  }
};
```

Rules:

- Use a unique stable key such as `crystalJourney`, `kiwiLandTravel`, or `newAuthorTopic`
- Keep the original post title intact when possible
- Preserve the original Facebook URL for source validation
- Copy the full post text locally rather than a truncated summary
- Keep the reading experience internal to the mini app

## How to assign posts to categories

Add the same post key to the relevant arrays in `window.NZMM_CATEGORIES`.

```js
window.NZMM_CATEGORIES = {
  planning: ["authorPostKey", "anotherPostKey"],
  visa: ["authorPostKey"],
  school: ["anotherPostKey"],
  money: [],
  family: [],
  arrival: []
};
```

Important notes:

- A post can belong to more than one category
- Totals are generated from the dataset at runtime
- Do not hard-code totals in HTML

## Author detection

The app currently recognizes the authors by testing the title and text for the Crystal marker.

```js
const author = /crystal/i.test(`${source.title || ''} ${source.text || ''}`)
  ? 'Crystal'
  : 'Kiwi Land';
```

This logic is intentionally simple and works because the Crystal posts are stored with their own post IDs and titles.

If a new author is added later, update the author logic and author button generation in `_nzmm.js` to include that author name.

## Landing page behavior

The landing page is built to show:

- total article count
- category totals
- author filter buttons
- search box
- filtered content library

All of those values come from `window.NZMM_POSTS` and `window.NZMM_CATEGORIES`.

## Detail page behavior

Single-post pages render content from a selected article using the query parameter:

```text
?id=postKey
```

Example:

```text
006-Planning-Application-Original.html?id=crystalJourney
```

The detail view should:

- read the `id` from the URL
- load the matching article from `window.NZMM_POSTS`
- render the full text locally
- keep the source link visible for reference
- not redirect away from the mini app

## Content maintenance workflow

Use this checklist for future updates:

1. Add the post to `data/posts.js`
2. Add the post key to the relevant category arrays
3. Verify the title, URL, and full text are present
4. Confirm the author detection still matches the expected author
5. Refresh the app and confirm totals and filters update
6. Check that the local article opens inside the app without redirecting

## Validation checklist

Before publishing new content, confirm:

- [ ] each article has a unique post key
- [ ] each post has a valid `title`, `url`, and copied `text`
- [ ] the article appears in the correct category arrays
- [ ] counts match the actual dataset
- [ ] author filters match the author names in the dataset
- [ ] the app still reads locally and does not rely on external redirects

## Maintenance reminder

The source of truth is `data/collection.json`. The directory and article rendering should come from that canonical dataset, not from manually duplicated HTML text.

This archive is designed for local reading and source preservation. It is not a redirect portal to social media pages.

This is general planning information, not professional immigration advice. Readers should verify current rules with official sources such as Immigration New Zealand, education providers, and the official visa information before making decisions.
