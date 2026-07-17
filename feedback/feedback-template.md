<!-- Feedback template. Copy to your repo (e.g. feedback/feedback.md), fill, link in report.md.
     Use ONE of: interview / feedback / open-issues. This one = written feedback you collected. -->

# User Feedback — FastOrder

- **How collected:** GitHub issue report ([#14](https://github.com/SiThuTun-mdy/fast-order/issues/14)) — 1 reporter
- **When:** 2026-07-17

## Raw feedback

<!-- Paste or summarize what people said. Keep their real words where you can. -->

1. "Order status page: Canceled step renders broken `:cancelled:` text instead of an icon" — the Canceled step in the order progress stepper shows the literal string `:cancelled:` inside the step dot instead of a proper icon.
2. The other steps use real emoji (🧾, 👨‍🍳, 🎉), so the broken placeholder stands out and makes the page look unfinished.
3. Expected a proper cancel icon (e.g. the `Ban` icon from `lucide-react`, already a project dependency), sized to match the stepper's checkmark and colored red.

## Themes (what keeps coming up)

- Visual polish bugs on the order status page undermine trust in the order tracking flow.
- Placeholder content (`:cancelled:`) shipped to the UI — no visual check on rarely-hit states like canceled orders.
- Icon usage is inconsistent (emoji vs. SVG vs. placeholder text) across the stepper.

## Top 3 things to fix

- [x] Replace the `:cancelled:` placeholder with the lucide-react `Ban` icon (fixed in `fa1d26c`, closes #14)
- [ ] Review other rarely-shown states (canceled, error, empty) for similar placeholder/broken UI
- [ ] Standardize step icons on one system (lucide icons or emoji) for consistency
