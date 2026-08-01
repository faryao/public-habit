# Public Habit

A calendar-first public habit tracker for GitHub Pages. Each Habit has its own monthly calendar, and a day counts as proved only when its Markdown Proof Record contains an image.

## Publish it

1. Create a public GitHub repository named `public-habit` under the `faryao` account.
2. Upload this project to the repository's `main` branch.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
5. GitHub publishes the site at <https://faryao.github.io/public-habit/>.

## Create a Habit

Use **Create your first habit on GitHub** or the `+` beside the Habit list. Choose an immutable lowercase filename made from letters, numbers, and hyphens:

```text
_habits/morning-walk.md
```

The file needs only a display name:

```yaml
---
name: Morning walk
---
```

Habits are listed alphabetically by display name. Change the name by editing its file. Delete a Habit by deleting only that file; its Proof Records remain in the repository and reappear if the same filename is recreated.

## Add image proof

Choose a Habit and month, then click an empty day. GitHub opens a new file at:

```text
_proofs/<habit-identifier>/<YYYY-MM-DD>.md
```

Paste an image below the prefilled front matter, remove the instruction, and commit the file. GitHub stores the pasted public image, and GitHub Pages rebuilds the calendar. A Proof Record without an image appears with a warning state.

Filled days open the published Proof Record. Use **Edit on GitHub** there to replace its image, edit its Markdown, or delete the record.

## Preview locally

```sh
bundle install
bundle exec jekyll serve
```

Open <http://localhost:4000/public-habit/>.

## Content model

- Habit: `_habits/<habit-identifier>.md`
- Proof Record: `_proofs/<habit-identifier>/<YYYY-MM-DD>.md`
- A valid Habit Identifier matches `[a-z0-9]+(-[a-z0-9]+)*`.
- A valid Proof Record contains at least one Markdown image; the first image becomes the cropped calendar thumbnail.
- The calendar uses Monday as its first day and Europe/Dublin for today's date.
- Past and future months are both writable.

