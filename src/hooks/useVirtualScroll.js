/**
 * useVirtualScroll — Custom virtualization hook
 *
 * === Virtualization Math ===
 * itemHeight   : fixed pixel height of each row (constant)
 * totalItems   : total number of data items
 * containerHeight: measured height of the scroll viewport via ResizeObserver
 * scrollTop    : current scroll offset of the container (from onScroll)
 *
 * visibleCount = Math.ceil(containerHeight / itemHeight)
 *   → how many rows fit fully or partially in view
 *
 * startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
 *   → first row to render (scrolled-past rows minus buffer above)
 *
 * endIndex = Math.min(totalItems, startIndex + visibleCount + buffer * 2)
 *   → last row to render (visible rows + buffer below)
 *
 * totalHeight = totalItems * itemHeight
 *   → spacer div height makes scrollbar match real dataset size
 *
 * offsetY = startIndex * itemHeight
 *   → absolute top offset for the rendered row block so rows
 *     appear in the correct scroll position
 *
 * === Intentional Bug (documented) ===
 * The onScroll handler is created once on mount and captures the initial
 * `containerRef.current` in a stale closure. When the window is resized and
 * `containerHeight` changes (detected by ResizeObserver), the scroll handler
 * still references the OLD `containerHeight` from when it was first created —
 * because the event listener is added in a useEffect with an EMPTY dependency
 * array [] and never cleaned up/re-added when `containerHeight` changes.
 * This causes incorrect startIndex/endIndex calculations after resize until
 * the user scrolls again (triggering a fresh read of scrollTop).
 * Fix: include `containerHeight` in the scroll handler's useEffect deps.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const ITEM_HEIGHT = 56  // px — fixed row height
const BUFFER      = 5  // rows to render above and below viewport

export function useVirtualScroll(totalItems) {
  const containerRef    = useRef(null)
  const [scrollTop,       setScrollTop]       = useState(0)
  const [containerHeight, setContainerHeight] = useState(600)

  // Measure container height via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // ⚠️ INTENTIONAL BUG: stale closure on containerHeight
  // The scroll listener is registered once with an empty dep array.
  // containerHeight inside this closure is always the INITIAL value (600).
  // After window resize updates containerHeight via ResizeObserver above,
  // the scroll calculations below remain based on the stale 600px value
  // until the user scrolls, which creates misaligned renders post-resize.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => {
      // BUG: `containerHeight` here is frozen at the initial captured value
      // because this closure was created when BUFFER=5, containerHeight=600
      setScrollTop(el.scrollTop)
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    // Missing cleanup intentionally omitted to compound the leak on re-attach
    // (a fresh listener is added each StrictMode double-invoke in dev)
    return () => el.removeEventListener('scroll', handleScroll)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // ^^^ intentionally empty — the bug lives here

  const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT)
  const startIndex   = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER)
  const endIndex     = Math.min(totalItems, startIndex + visibleCount + BUFFER * 2)
  const totalHeight  = totalItems * ITEM_HEIGHT
  const offsetY      = startIndex * ITEM_HEIGHT

  return {
    containerRef,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    itemHeight: ITEM_HEIGHT,
  }
}
