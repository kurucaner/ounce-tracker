# Memory Leak Investigation Plan

## Current Situation

You've noticed memory usage increasing over time. We've identified 20 potential leak sources, but we need to **verify which ones are actually causing the problem** before implementing fixes.

## Approach: Measure First, Fix Second

Instead of implementing fixes blindly, we'll:

1. ✅ **Add diagnostic tools** to measure memory accurately
2. 🔍 **Run diagnostics** to identify the actual leak sources
3. 🎯 **Implement targeted fixes** based on evidence
4. ✅ **Verify fixes** by re-running diagnostics

## What We've Added

### 1. Memory Profiler (`memory-profiler.ts`)

A comprehensive diagnostic tool that tracks:
- **Node.js memory**: Heap, RSS, external, array buffers
- **Browser metrics**: Page count, context count, open page URLs
- **Trends**: Calculates memory growth patterns
- **Analysis**: Automatically identifies potential issues

### 2. Integrated Profiling

The profiler is integrated into the main scraper with:
- **Optional activation** via `ENABLE_MEMORY_PROFILING=true`
- **Automatic snapshots** at key points (before/after operations)
- **Periodic analysis** every 20 cycles
- **Self-cleaning** to prevent the profiler itself from leaking

### 3. Documentation

- `MEMORY_DIAGNOSTICS.md`: Complete guide on using the profiler
- This file: Investigation plan and next steps

## Next Steps

### Phase 1: Baseline Measurement (Do This First)

1. **Enable profiling**:
   ```bash
   export ENABLE_MEMORY_PROFILING=true
   ```

2. **Run the worker** for 20-30 cycles:
   ```bash
   bun run apps/worker/src/index.ts
   ```

3. **Document findings**:
   - Starting memory values
   - Memory after 10 cycles
   - Memory after 20 cycles
   - Which metrics are growing?
   - What's the growth rate?

### Phase 2: Identify Leak Sources

Based on the profiler output, identify:

1. **Is it Node.js heap?** (JavaScript objects)
   - If `heapUsed` grows → JavaScript object leak
   - Check: Results arrays, closures, event listeners

2. **Is it browser process?** (External memory)
   - If `external` grows → Browser process leak
   - Check: Page state, DOM, JS contexts, network cache

3. **Is it page accumulation?**
   - If `Browser Pages` count grows → Pages not closing
   - Check: Cloudflare-protected page cleanup

4. **Is it storage?**
   - If memory grows more on certain sites → Storage leak
   - Check: IndexedDB, localStorage, sessionStorage

### Phase 3: Test Specific Hypotheses

Based on Phase 2 findings, test specific scenarios:

#### If External Memory is Growing:
- Test: Monitor memory before/after browser cleanup
- Test: Monitor memory before/after page recreation
- Hypothesis: Browser process retaining state

#### If Heap is Growing:
- Test: Monitor memory before/after each scrape
- Test: Check if results arrays are cleared
- Hypothesis: JavaScript objects accumulating

#### If Page Count is Growing:
- Test: Monitor page count after each Cloudflare-protected scrape
- Hypothesis: Pages not being closed properly

### Phase 4: Implement Targeted Fixes

Only after identifying the actual leak source:

1. **Implement one fix at a time**
2. **Re-run diagnostics** to verify the fix works
3. **Measure improvement** (how much memory saved?)
4. **Move to next fix** if needed

## Potential Fixes (Based on Findings)

### If External Memory is the Issue:
- ✅ Already implemented: Browser storage clearing
- ✅ Already implemented: Page recreation
- 🔍 To test: IndexedDB clearing
- 🔍 To test: Service worker unregistration
- 🔍 To test: Network cache clearing

### If Heap is the Issue:
- ✅ Already implemented: Results array clearing
- 🔍 To test: Error object cleanup
- 🔍 To test: Promise chain optimization
- 🔍 To test: Closure cleanup

### If Pages are Accumulating:
- ✅ Already implemented: Page cleanup for Cloudflare sites
- 🔍 To test: Verify pages are actually closed
- 🔍 To test: Check for page reference leaks

## Verification Checklist

After implementing fixes, verify:

- [ ] Memory growth rate reduced
- [ ] No new leaks introduced
- [ ] Performance not significantly impacted
- [ ] Fix works across multiple cycles (20+)
- [ ] Production-ready (profiling can be disabled)

## Timeline Recommendation

1. **Week 1**: Run diagnostics, identify leak sources
2. **Week 2**: Implement targeted fixes based on findings
3. **Week 3**: Verify fixes, monitor in production
4. **Week 4**: Optimize further if needed

## Success Criteria

- Memory growth rate < 5MB per day (currently unknown)
- No memory leaks over 7+ days of continuous operation
- Memory stabilizes after initial warm-up period

## Questions to Answer

Before implementing fixes, answer:

1. **What's the actual growth rate?** (MB per cycle/day)
2. **Which memory metric is growing?** (heap/external/RSS)
3. **When does it grow?** (during scrape/cleanup/idle)
4. **Is it linear or exponential?**
5. **Does cleanup help?** (memory goes down after cleanup)
6. **Does page recreation help?** (memory goes down after recreate)

## Tools Available

- ✅ Memory profiler (built-in)
- ✅ Trend analysis (automatic)
- ✅ Browser metrics (page/context count)
- 🔍 Bun inspector (for heap snapshots)
- 🔍 External tools (htop, Chrome DevTools)

## Getting Help

If diagnostics show unexpected results:

1. Review `MEMORY_DIAGNOSTICS.md` for interpretation
2. Check profiler output for specific error messages
3. Compare with known good baseline
4. Consider external factors (system memory pressure, other processes)

