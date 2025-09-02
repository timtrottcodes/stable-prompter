# Stable Diffusion Prompt Manager

A web-based app for building, managing, and reusing Stable Diffusion prompts. This project uses HTML, Bootstrap, and vanilla JavaScript with a clean sidebar UI for categories and snippets.

## Features

* **Prompt and Negative Prompt Areas:**

  * Lowercase, deduplicate, and format prompts.
* **Prompt Slots:**

  * Save, clear, export, and import prompts.
* **Prompt Builder Sidebar:**

  * Categories with key/value snippet pairs.
  * Add, edit, delete, and rename snippets.
  * Drag and drop snippets within or between categories.
  * Add new categories.
  * Import/export categories as JSON.
* **Image Import:**

  * Drag and drop PNGs from Automatic1111 or ComfyUI.
  * Reads prompt metadata from PNG files.
  * Add selections from imported prompts to snippets.
* **Interactive UI:**

  * Checkboxes for adding/removing snippet keywords from prompts.
  * Bootstrap modal for editing snippets.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/timtrottcodes/stable-prompter
```

2. Open `index.html` in a modern browser.

> No server required. Fully client-side.

## Usage

1. **Add or Manage Categories and Snippets:**

   * Use the sidebar to add new categories.
   * Click the edit (✏️) icon to modify a snippet.
   * Click the delete (🗑️) icon to remove a snippet.
   * Drag and drop snippets to reorder or move between categories.
2. **Build Prompts:**

   * Click checkboxes to add/remove snippet keywords to/from the main prompt.
   * Use formatting buttons (Lowercase, Deduplicate, Format).
3. **Save Prompts:**

   * Save current prompt/negative prompt as a slot.
   * Export or import slots as JSON.
4. **Import Prompts from PNG:**

   * Drag & drop a PNG containing prompt metadata.
   * Select part of the prompt and add it to snippets.

## File Structure

```
├── index.html       # Main application
├── README.md        # This file
```

## Dependencies

* [Bootstrap 5](https://getbootstrap.com/) (CSS and JS bundle)
* [Font Awesome 6](https://fontawesome.com/) for icons

## License

MIT License
