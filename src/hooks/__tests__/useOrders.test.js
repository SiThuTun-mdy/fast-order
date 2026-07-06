import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrder } from '../useOrders';

// RTL's `waitFor` polls using real setTimeout under the hood and does not
// reliably detect Vitest's fake timers, so it can hang once fake timers are
// active. Flushing the microtask queue via an empty async `act` is enough
// here because the mocked `getOrder` promises settle on microtasks, not
// timers — only the 5s poll interval itself needs fake-timer advancement.
async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

// Mock at the API-layer boundary (src/api/orders.js), not the underlying axios
// client — this is the seam the hook actually depends on.
vi.mock('../../api/orders', () => ({
  getOrder: vi.fn(),
}));

import { getOrder } from '../../api/orders';

const POLL_INTERVAL_MS = 5000;
const FAKE_ORDER_ID = 'ORD-TEST-1';

function buildOrder(overrides = {}) {
  return {
    id: FAKE_ORDER_ID,
    status: 'confirmed',
    ...overrides,
  };
}

describe('useOrder', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getOrder.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('starts in a loading state before the initial fetch resolves', async () => {
    getOrder.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useOrder(FAKE_ORDER_ID));

    expect(result.current.loading).toBe(true);
    expect(result.current.order).toBeNull();
  });

  it('populates the order and clears loading after a successful fetch', async () => {
    const order = buildOrder({ status: 'confirmed' });
    getOrder.mockResolvedValue(order);

    const { result } = renderHook(() => useOrder(FAKE_ORDER_ID));
    await flushMicrotasks();

    expect(result.current.loading).toBe(false);
    expect(result.current.order).toEqual(order);
    expect(result.current.error).toBeNull();
  });

  it('sets an error message and stops loading when the fetch rejects', async () => {
    getOrder.mockRejectedValue(new Error('Order not found'));

    const { result } = renderHook(() => useOrder(FAKE_ORDER_ID));
    await flushMicrotasks();

    expect(result.current.error).toBe('Order not found');
    expect(result.current.order).toBeNull();
  });

  it('polls again after the interval elapses while status is not "ready"', async () => {
    getOrder.mockResolvedValue(buildOrder({ status: 'confirmed' }));

    renderHook(() => useOrder(FAKE_ORDER_ID));
    await flushMicrotasks();
    expect(getOrder).toHaveBeenCalledTimes(1);

    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS));

    expect(getOrder).toHaveBeenCalledTimes(2);
  });

  it('stops polling once the order status becomes "ready"', async () => {
    getOrder.mockResolvedValue(buildOrder({ status: 'ready' }));

    renderHook(() => useOrder(FAKE_ORDER_ID));
    await flushMicrotasks();
    expect(getOrder).toHaveBeenCalledTimes(1);

    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3));

    expect(getOrder).toHaveBeenCalledTimes(1);
  });

  // Known bug (documented, not fixed here): the polling effect only stops when
  // `order?.status === 'ready'`. On a persistent fetch error, `order` is never
  // set, so `order?.status` stays `undefined` forever and the hook keeps
  // retrying on every interval tick indefinitely — even for a permanent
  // "not found" error that will never resolve differently.
  it('keeps polling indefinitely on a persistent fetch error (current buggy behavior)', async () => {
    getOrder.mockRejectedValue(new Error('Order not found'));

    renderHook(() => useOrder(FAKE_ORDER_ID));
    await flushMicrotasks();
    expect(getOrder).toHaveBeenCalledTimes(1);

    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3));

    // Demonstrates the bug: still retrying after 3 more intervals with no
    // backoff and no stop condition, despite every attempt failing the same way.
    expect(getOrder).toHaveBeenCalledTimes(4);
  });
});
