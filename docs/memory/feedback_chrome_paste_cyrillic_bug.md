---
name: feedback-chrome-paste-cyrillic-bug
description: Cmd+V paste via the claude-in-chrome browser tool corrupts non-ASCII (Cyrillic) text; workaround is a byte-remap fix in-page
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8dc8d4f8-5f2b-4234-896d-87c65017ce33
  modified: 2026-08-26T17:33:58.634Z
---

Pasting large clipboard content (via `pbcopy` + simulated Cmd+V) into a real Chrome page through the `claude-in-chrome` MCP tool corrupts every non-ASCII character. All-ASCII content (HTML tags, CSS, JS, base64 image data) pastes correctly and fast; only Cyrillic/typographic characters (—, «», №, nbsp, etc.) get mangled — verified the exact transform is "original UTF-8 bytes decoded as `x-mac-cyrillic`" (Python: `orig.encode('utf-8').decode('mac_cyrillic') == corrupted`, byte-for-byte, confirmed via SHA-256).

**Why it matters**: the `type` action (real keyboard simulation) handles Unicode/Cyrillic correctly, but is impractical for large payloads (can't pass content bigger than a single Read call can hold in context, and this project's pages have base64 image lines of 100–300KB each that must go in as one contiguous string). Clipboard paste is the only way to move that much content in one shot, but it silently corrupts the Cyrillic text every time.

**How to apply**: when pasting a large HTML file with Cyrillic text into a GetCourse code editor (or any similar CodeMirror-based admin field) via this tool:
1. `cmd+a` + `cmd+v` as normal (fast, correct for ASCII/base64, corrupts non-ASCII).
2. Immediately run a JS fix in the page: build a 256-entry byte↔char map for `x-mac-cyrillic` (Python `codecs` can generate it: `{bytes([b]).decode('mac_cyrillic'): b for b in range(256)}`), map every character in the corrupted string back to its byte (ASCII chars pass through as their own code, non-ASCII chars look up the byte), feed the resulting `Uint8Array` through `new TextDecoder('utf-8').decode(...)`, then `cm.setValue(fixedString)`.
3. Verify with a SHA-256 hash of `TextEncoder().encode(cm.getValue())` against `shasum -a 256` of the local source file — do this every time before saving, it's cheap and catches any remaining mismatch immediately.

Relevant to [[feedback_getcourse_class_collision]] since both surfaced in the same "Денежные гипотезы" (`ingaprihodko-jpg/test` repo) editing session.
