# Memory Leak Diagnostics Guide

This guide explains how to use the memory profiler to identify and verify memory leaks before implementing fixes.

## Quick Start

### 1. Enable Memory Profiling

Set the environment variable to enable detailed memory tracking:

```bash
export ENABLE_MEMORY_PROFILING=true
```

Or in Docker:
```bash
docker run -e ENABLE_MEMORY_PROFILING=true ...
```

### 2. Run the Worker

Start the worker normally. With profiling enabled, you'll see detailed memory snapshots:

```bash
bun run apps/worker/src/index.ts
```

### 3. Monitor Output

The profiler will log:
- **Memory snapshots** at key points (before/after scrape, cleanup, page recreate)
- **Browser metrics** (page count, context count, open page URLs)
- **Trend analysis** every 20 cycles showing memory growth patterns
- **Potential issues** automatically identified

## What to Look For

### Red Flags 🚨

1. **Heap Used Growing Consistently**
   - If `heapUsed` increases by >10MB per cycle consistently
   - Indicates JavaScript object leaks

2. **External Memory Growing**
   - If `external` memory grows significantly
   - Indicates browser process memory leak

3. **RSS Growing**
   - If `rss` (Resident Set Size) grows >50MB per cycle
   - Indicates overall process memory leak

4. **Page Count Increasing**
   - If `Browser Pages` count keeps growing
   - Indicates pages not being closed properly

5. **Context Count Growing**
   - If `Browser Contexts` count increases
   - Indicates browser contexts not being cleaned up

### Example Output

```
📊 Memory Snapshot [Cycle 5] - After scrape:
   Heap: 245.32MB / 512.00MB
   RSS: 512.45MB
   External: 128.23MB
   ArrayBuffers: 12.45MB
   Browser Pages: 1
   Browser Contexts: 1

🔍 MEMORY LEAK ANALYSIS
============================================================
📈 Trend: INCREASING
   Heap Used: +45.23MB
   Heap Total: +32.10MB
   RSS: +89.45MB
   External: +34.12MB
   Browser Pages: +0

🚨 Potential Issues:
   ⚠️ Significant heap growth detected - possible JavaScript object leak
   ⚠️ External memory growing - possible browser process leak
   ⚠️ RSS growing significantly - overall process memory leak
```

## Diagnostic Steps

### Step 1: Baseline Measurement

Run for 10-20 cycles with profiling enabled and note:
- Starting memory values
- Memory after first cycle
- Memory after 10 cycles
- Memory after 20 cycles

### Step 2: Identify Growth Pattern

Look at the trend analysis:
- **Increasing trend**: Memory leak confirmed
- **Stable trend**: No leak (or leak is very slow)
- **Decreasing trend**: Memory is being freed

### Step 3: Correlate with Operations

Check snapshots at different points:
- Does memory grow after each scrape?
- Does cleanup actually reduce memory?
- Does page recreation help?
- Is external memory (browser) the main culprit?

### Step 4: Test Hypotheses

Based on the 20 potential leak sources identified, test specific scenarios:

#### Test 1: Browser Process Memory
- Monitor `external` memory specifically
- If it grows, the leak is in the Chromium process

#### Test 2: Page Accumulation
- Check if `Browser Pages` count increases
- If yes, pages aren't being closed

#### Test 3: Storage Leaks
- Check if memory grows more on sites using localStorage/IndexedDB
- Compare memory after scraping sites with/without storage

#### Test 4: Route Handler Leaks
- Monitor memory before/after cleanup
- If cleanup doesn't help, route handlers might not be the issue

## Advanced Diagnostics

### Using Bun's Built-in Profiler

Bun has built-in profiling capabilities:

```bash
# Generate heap snapshot
bun --inspect apps/worker/src/index.ts

# Then connect Chrome DevTools to inspect memory
```

### Using External Tools

1. **htop/top**: Monitor overall process memory
2. **Chrome DevTools**: Connect to Bun's inspector for heap analysis
3. **Bun's profiler**: Built-in profiling tools

### Exporting Snapshots

The profiler stores snapshots in memory. You can export them programmatically:

```typescript
const snapshots = profiler.getSnapshots();
// Export to JSON for analysis
```

## Interpreting Results

### Memory Metrics Explained

- **Heap Used**: JavaScript objects in use
- **Heap Total**: Total heap allocated
- **External**: Memory used by C++ objects (browser, buffers)
- **RSS**: Total memory used by the process
- **ArrayBuffers**: Typed array memory

### Growth Patterns

1. **Linear Growth**: Consistent leak (easy to fix)
2. **Exponential Growth**: Cascading leak (critical)
3. **Step Growth**: Leak triggered by specific operations
4. **Plateau then Growth**: Memory fills up, then leaks

## Next Steps After Diagnosis

Once you've identified the leak source:

1. **Document the finding**: Which metric is growing?
2. **Correlate with code**: Which operations cause growth?
3. **Test fixes incrementally**: One fix at a time
4. **Verify with profiling**: Re-run diagnostics after each fix
5. **Compare before/after**: Measure improvement

## Example Workflow

```bash
# 1. Enable profiling
export ENABLE_MEMORY_PROFILING=true

# 2. Run for 20 cycles
bun run apps/worker/src/index.ts

# 3. Review output, identify leak source

# 4. Implement targeted fix (e.g., clear IndexedDB)

# 5. Re-run with profiling to verify fix

# 6. Disable profiling for production
unset ENABLE_MEMORY_PROFILING
```

## Production Monitoring

For production, you can:
- Log memory snapshots periodically (every N cycles)
- Set up alerts if memory exceeds thresholds
- Track memory trends over time

Example threshold check:
```typescript
if (snapshot.nodejs.heapUsed > 500) {
  console.warn('⚠️ Memory usage high:', snapshot.nodejs.heapUsed);
}
```

## Troubleshooting

### Profiler Not Showing Data
- Check `ENABLE_MEMORY_PROFILING=true` is set
- Verify browser is initialized before taking snapshots

### Too Much Output
- Increase `PROFILING_ANALYSIS_INTERVAL` (currently 20 cycles)
- Reduce snapshot frequency in code

### Profiler Itself Leaking
- The profiler clears old snapshots (keeps last 100)
- If needed, reduce `keepLast` parameter

