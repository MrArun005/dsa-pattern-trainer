import type { Pattern } from './types.ts'

export const slidingWindow: Pattern = {
  id: 'sliding-window',
  name: 'Sliding Window',
  trigger: 'A contiguous run — subarray or substring — where recomputing each candidate from scratch is the waste.',
  cues: [
    'The words "contiguous", "subarray", "substring", "consecutive".',
    'A fixed size k → the window never changes width, it just walks.',
    'A condition instead of a size ("sum ≥ target", "no repeats") → the window grows on the right and shrinks from the left.',
    'Brute force recomputes overlapping work. A window reuses it: add the entering element, remove the leaving one.',
  ],
  traps: [
    'Recomputing the whole window each step — that is the O(n·k) version you came to avoid.',
    'Shrinking with if instead of while. Sometimes several elements must leave before the condition holds again.',
    'Returning Infinity when nothing qualifies. Decide the not-found value up front (usually 0).',
    'Updating the best answer at the wrong moment — for shrink-to-minimum it goes *inside* the while, not after it.',
  ],
  complexity: 'O(n) — each index enters and leaves the window at most once · O(1) or O(k) space',
  template: {
    js: `let l = 0, best = 0, sum = 0
for (let r = 0; r < nums.length; r++) {
  sum += nums[r]                 // the element entering on the right
  while (/* window is invalid */) {
    sum -= nums[l]               // the element leaving on the left
    l++
  }
  best = Math.max(best, r - l + 1)
}`,
    py: `l = best = total = 0
for r, x in enumerate(nums):
    total += x                   # the element entering on the right
    while ...:                   # while the window is invalid
        total -= nums[l]         # the element leaving on the left
        l += 1
    best = max(best, r - l + 1)`,
  },
  problems: [
    {
      id: 'max-sum-subarray-k',
      title: 'Maximum sum of a subarray of size k',
      difficulty: 'easy',
      prompt: 'Given an array of integers and a window size k, return the largest sum of any k consecutive elements.',
      trick: 'Sum the first k once, then add the entering element and subtract the leaving one.',
      fn: { js: 'maxSumSubarray', py: 'max_sum_subarray' },
      stub: {
        js: `function maxSumSubarray(nums, k) {\n  \n}`,
        py: `def max_sum_subarray(nums, k):\n    pass`,
      },
      solution: {
        js: `function maxSumSubarray(nums, k) {
  let sum = 0
  for (let i = 0; i < k; i++) sum += nums[i]
  let best = sum
  for (let r = k; r < nums.length; r++) {
    sum += nums[r] - nums[r - k]
    best = Math.max(best, sum)
  }
  return best
}`,
        py: `def max_sum_subarray(nums, k):
    total = sum(nums[:k])
    best = total
    for r in range(k, len(nums)):
        total += nums[r] - nums[r - k]
        best = max(best, total)
    return best`,
      },
      tests: [
        { args: [[2, 1, 5, 1, 3, 2], 3], expected: 9 },
        { args: [[2, 3, 4, 1, 5], 2], expected: 7 },
        { args: [[1], 1], expected: 1 },
        { args: [[5, 5, 5], 2], expected: 10 },
        { args: [[-3, -1, -4, -2], 2], expected: -3 },
      ],
      hints: [
        'The obvious version sums k elements for every start position. How much of that sum did you already have?',
        'Two consecutive windows differ by exactly two elements: one enters, one leaves.',
        'sum += nums[r] - nums[r - k]. Seed it with the first k, then never re-add anything.',
      ],
    },
    {
      id: 'longest-no-repeat',
      title: 'Longest substring without repeating characters',
      difficulty: 'medium',
      prompt: 'Return the length of the longest substring of s that contains no repeated character.',
      trick: 'Remember where each character last appeared, and jump the left edge past it.',
      fn: { js: 'longestNoRepeat', py: 'longest_no_repeat' },
      stub: {
        js: `function longestNoRepeat(s) {\n  \n}`,
        py: `def longest_no_repeat(s):\n    pass`,
      },
      solution: {
        js: `function longestNoRepeat(s) {
  const last = new Map()
  let l = 0, best = 0
  for (let r = 0; r < s.length; r++) {
    const c = s[r]
    if (last.has(c) && last.get(c) >= l) l = last.get(c) + 1
    last.set(c, r)
    best = Math.max(best, r - l + 1)
  }
  return best
}`,
        py: `def longest_no_repeat(s):
    last = {}
    l = best = 0
    for r, c in enumerate(s):
        if c in last and last[c] >= l:
            l = last[c] + 1
        last[c] = r
        best = max(best, r - l + 1)
    return best`,
      },
      tests: [
        { args: ['abcabcbb'], expected: 3 },
        { args: ['bbbbb'], expected: 1 },
        { args: ['pwwkew'], expected: 3 },
        { args: [''], expected: 0 },
        { args: ['dvdf'], expected: 3 },
        { args: ['tmmzuxt'], expected: 5 },
      ],
      hints: [
        'The window must always hold distinct characters. What do you need to remember to know a character repeated?',
        'A map from character to the index where you last saw it.',
        'The guard last.get(c) >= l matters: a duplicate from *before* the window is not a duplicate any more, and without it the left edge jumps backwards.',
      ],
    },
    {
      id: 'min-size-subarray-sum',
      title: 'Minimum size subarray sum',
      difficulty: 'medium',
      prompt:
        'Given a target and an array of positive integers, return the length of the shortest contiguous subarray whose sum is ≥ target. Return 0 if none exists.',
      trick: 'Grow right until valid, then shrink left as far as it stays valid, recording the length each time.',
      fn: { js: 'minSubArrayLen', py: 'min_sub_array_len' },
      stub: {
        js: `function minSubArrayLen(target, nums) {\n  \n}`,
        py: `def min_sub_array_len(target, nums):\n    pass`,
      },
      solution: {
        js: `function minSubArrayLen(target, nums) {
  let l = 0, sum = 0, best = Infinity
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r]
    while (sum >= target) {
      best = Math.min(best, r - l + 1)
      sum -= nums[l]
      l++
    }
  }
  return best === Infinity ? 0 : best
}`,
        py: `def min_sub_array_len(target, nums):
    l = total = 0
    best = float('inf')
    for r, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, r - l + 1)
            total -= nums[l]
            l += 1
    return 0 if best == float('inf') else best`,
      },
      tests: [
        { args: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
        { args: [4, [1, 4, 4]], expected: 1 },
        { args: [11, [1, 1, 1, 1, 1, 1, 1, 1]], expected: 0 },
        { args: [11, [1, 2, 3, 4, 5]], expected: 3 },
        { args: [5, [5]], expected: 1 },
      ],
      hints: [
        'This is the "shrink to minimum" shape, the mirror of "grow to maximum". Which edge moves when the window is already valid?',
        'Record the length *inside* the shrink loop — every shrink that stays valid is a shorter answer.',
        'Return 0, not Infinity, when nothing qualifies. Pick the not-found value before you write the loop.',
      ],
    },
    {
      id: 'char-replacement',
      title: 'Longest repeating character replacement',
      difficulty: 'medium',
      prompt:
        'Given a string and an integer k, you may replace at most k characters with any other character. Return the length of the longest run of a single repeated character you can produce.',
      trick: 'A window is valid while its size minus its most common character is at most k.',
      fn: { js: 'characterReplacement', py: 'character_replacement' },
      stub: {
        js: `function characterReplacement(s, k) {\n  \n}`,
        py: `def character_replacement(s, k):\n    pass`,
      },
      solution: {
        js: `function characterReplacement(s, k) {
  const count = new Map()
  let l = 0, best = 0
  for (let r = 0; r < s.length; r++) {
    count.set(s[r], (count.get(s[r]) ?? 0) + 1)
    while (r - l + 1 - Math.max(...count.values()) > k) {
      count.set(s[l], count.get(s[l]) - 1)
      if (count.get(s[l]) === 0) count.delete(s[l])
      l++
    }
    best = Math.max(best, r - l + 1)
  }
  return best
}`,
        py: `def character_replacement(s, k):
    count = {}
    l = best = 0
    for r, c in enumerate(s):
        count[c] = count.get(c, 0) + 1
        while (r - l + 1) - max(count.values()) > k:
            count[s[l]] -= 1
            if count[s[l]] == 0:
                del count[s[l]]
            l += 1
        best = max(best, r - l + 1)
    return best`,
      },
      tests: [
        { args: ['ABAB', 2], expected: 4 },
        { args: ['AABABBA', 1], expected: 4 },
        { args: ['AAAA', 0], expected: 4 },
        { args: ['', 2], expected: 0 },
        { args: ['ABCDE', 1], expected: 2 },
      ],
      hints: [
        'You never actually perform replacements. What has to be true about a window for k replacements to make it uniform?',
        'Every character except the most frequent one has to be replaced. So: size − maxCount ≤ k.',
        'Keep a frequency map of the window and shrink from the left while that inequality fails.',
      ],
    },
    {
      id: 'permutation-in-string',
      title: 'Permutation in string',
      difficulty: 'medium',
      prompt: 'Return true if any permutation of s1 appears as a contiguous substring of s2.',
      trick: 'A fixed window the length of s1, comparing character counts rather than order.',
      fn: { js: 'checkInclusion', py: 'check_inclusion' },
      stub: {
        js: `function checkInclusion(s1, s2) {\n  \n}`,
        py: `def check_inclusion(s1, s2):\n    pass`,
      },
      solution: {
        js: `function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false
  const need = new Map(), win = new Map()
  for (const c of s1) need.set(c, (need.get(c) ?? 0) + 1)

  const matches = () => {
    if (win.size !== need.size) return false
    for (const [c, n] of need) if (win.get(c) !== n) return false
    return true
  }

  for (let r = 0; r < s2.length; r++) {
    win.set(s2[r], (win.get(s2[r]) ?? 0) + 1)
    if (r >= s1.length) {
      const out = s2[r - s1.length]
      const n = win.get(out) - 1
      if (n === 0) win.delete(out)
      else win.set(out, n)
    }
    if (matches()) return true
  }
  return false
}`,
        py: `def check_inclusion(s1, s2):
    from collections import Counter
    if len(s1) > len(s2):
        return False
    need = Counter(s1)
    win = Counter(s2[:len(s1)])
    if win == need:
        return True
    for r in range(len(s1), len(s2)):
        win[s2[r]] += 1
        out = s2[r - len(s1)]
        win[out] -= 1
        if win[out] == 0:
            del win[out]
        if win == need:
            return True
    return False`,
      },
      tests: [
        { args: ['ab', 'eidbaooo'], expected: true },
        { args: ['ab', 'eidboaoo'], expected: false },
        { args: ['adc', 'dcda'], expected: true },
        { args: ['a', 'a'], expected: true },
        { args: ['abc', 'ab'], expected: false },
      ],
      hints: [
        'Generating every permutation is factorial. What actually makes two strings permutations of each other?',
        'Identical character counts. So the window is fixed-width and you compare frequency maps.',
        'Do not rebuild the map each step — one character enters and one leaves, and remember to delete keys that hit zero or the comparison breaks.',
      ],
    },
    {
      id: 'max-consecutive-ones',
      title: 'Max consecutive ones III',
      difficulty: 'medium',
      prompt:
        'Given a binary array and an integer k, return the length of the longest run of 1s you can get by flipping at most k zeros.',
      trick: 'Grow the window freely; shrink only while it holds more than k zeros.',
      fn: { js: 'longestOnes', py: 'longest_ones' },
      stub: { js: `function longestOnes(nums, k) {\n  \n}`, py: `def longest_ones(nums, k):\n    pass` },
      solution: {
        js: `function longestOnes(nums, k) {
  let l = 0, zeros = 0, best = 0
  for (let r = 0; r < nums.length; r++) {
    if (nums[r] === 0) zeros++
    while (zeros > k) {
      if (nums[l] === 0) zeros--
      l++
    }
    best = Math.max(best, r - l + 1)
  }
  return best
}`,
        py: `def longest_ones(nums, k):
    l = zeros = best = 0
    for r, x in enumerate(nums):
        if x == 0:
            zeros += 1
        while zeros > k:
            if nums[l] == 0:
                zeros -= 1
            l += 1
        best = max(best, r - l + 1)
    return best`,
      },
      tests: [
        { args: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], expected: 6 },
        { args: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], expected: 10 },
        { args: [[1, 1, 1], 0], expected: 3 },
        { args: [[0, 0, 0], 0], expected: 0 },
      ],
      hints: [
        'You do not need to track which zeros you flipped — only how many are inside the window.',
        'This is the same shape as "longest substring with at most k of something".',
        'One counter, one while loop. The answer is the largest window you ever held.',
      ],
    },
    {
      id: 'fruit-into-baskets',
      title: 'Fruit into baskets',
      difficulty: 'medium',
      prompt:
        'Given an array of fruit types, return the length of the longest contiguous run containing at most two distinct types.',
      trick: 'Longest window with at most two distinct keys — the map size is the condition.',
      fn: { js: 'totalFruit', py: 'total_fruit' },
      stub: { js: `function totalFruit(fruits) {\n  \n}`, py: `def total_fruit(fruits):\n    pass` },
      solution: {
        js: `function totalFruit(fruits) {
  const count = new Map()
  let l = 0, best = 0
  for (let r = 0; r < fruits.length; r++) {
    count.set(fruits[r], (count.get(fruits[r]) ?? 0) + 1)
    while (count.size > 2) {
      const out = fruits[l]
      const n = count.get(out) - 1
      if (n === 0) count.delete(out)
      else count.set(out, n)
      l++
    }
    best = Math.max(best, r - l + 1)
  }
  return best
}`,
        py: `def total_fruit(fruits):
    count = {}
    l = best = 0
    for r, f in enumerate(fruits):
        count[f] = count.get(f, 0) + 1
        while len(count) > 2:
            out = fruits[l]
            count[out] -= 1
            if count[out] == 0:
                del count[out]
            l += 1
        best = max(best, r - l + 1)
    return best`,
      },
      tests: [
        { args: [[1, 2, 1]], expected: 3 },
        { args: [[0, 1, 2, 2]], expected: 3 },
        { args: [[1, 2, 3, 2, 2]], expected: 4 },
        { args: [[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], expected: 5 },
        { args: [[1]], expected: 1 },
      ],
      hints: [
        '"Two baskets" is just a cap on distinct values. Generalise it to k and the problem gets easier to see.',
        'The map size *is* the number of distinct types in the window.',
        'Delete a key when its count reaches zero, or size never shrinks and the window grows forever.',
      ],
    },
    {
      id: 'min-window-substring',
      title: 'Minimum window substring',
      difficulty: 'hard',
      prompt:
        'Given strings s and t, return the shortest substring of s containing every character of t including duplicates. Return "" if there is none.',
      trick: 'Count what is still missing; when nothing is missing, shrink from the left.',
      fn: { js: 'minWindow', py: 'min_window' },
      stub: { js: `function minWindow(s, t) {\n  \n}`, py: `def min_window(s, t):\n    pass` },
      solution: {
        js: `function minWindow(s, t) {
  if (!s || !t) return ''
  const need = new Map()
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1)

  let missing = t.length, l = 0, bestL = 0, bestLen = Infinity
  for (let r = 0; r < s.length; r++) {
    const c = s[r]
    if (need.has(c)) {
      if (need.get(c) > 0) missing--
      need.set(c, need.get(c) - 1)
    }
    while (missing === 0) {
      if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l }
      const d = s[l]
      if (need.has(d)) {
        need.set(d, need.get(d) + 1)
        if (need.get(d) > 0) missing++
      }
      l++
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestL, bestL + bestLen)
}`,
        py: `def min_window(s, t):
    if not s or not t:
        return ''
    from collections import Counter
    need = Counter(t)
    missing = len(t)
    l = best_l = 0
    best_len = float('inf')
    for r, c in enumerate(s):
        if c in need:
            if need[c] > 0:
                missing -= 1
            need[c] -= 1
        while missing == 0:
            if r - l + 1 < best_len:
                best_len = r - l + 1
                best_l = l
            d = s[l]
            if d in need:
                need[d] += 1
                if need[d] > 0:
                    missing += 1
            l += 1
    return '' if best_len == float('inf') else s[best_l:best_l + best_len]`,
      },
      tests: [
        { args: ['ADOBECODEBANC', 'ABC'], expected: 'BANC' },
        { args: ['a', 'a'], expected: 'a' },
        { args: ['a', 'aa'], expected: '' },
        { args: ['aa', 'aa'], expected: 'aa' },
        { args: ['ab', 'b'], expected: 'b' },
      ],
      hints: [
        'Duplicates are what makes this hard. "Contains all of ABC" is not the same as "contains A, B and C once".',
        'Let counts go negative for surplus characters. A single missing counter then tells you when the window is valid.',
        'Only decrement missing when the need count is still positive — that is what stops surplus copies counting as progress.',
      ],
    },
    {
      id: 'sliding-window-maximum',
      title: 'Sliding window maximum',
      difficulty: 'hard',
      prompt: 'Given an array and window size k, return the maximum of every window of size k, in order.',
      trick: 'Keep a deque of indices whose values are decreasing; the front is always the max.',
      fn: { js: 'maxSlidingWindow', py: 'max_sliding_window' },
      stub: {
        js: `function maxSlidingWindow(nums, k) {\n  \n}`,
        py: `def max_sliding_window(nums, k):\n    pass`,
      },
      solution: {
        js: `function maxSlidingWindow(nums, k) {
  const out = [], dq = []
  for (let r = 0; r < nums.length; r++) {
    while (dq.length && nums[dq[dq.length - 1]] <= nums[r]) dq.pop()
    dq.push(r)
    if (dq[0] <= r - k) dq.shift()
    if (r >= k - 1) out.push(nums[dq[0]])
  }
  return out
}`,
        py: `def max_sliding_window(nums, k):
    from collections import deque
    out = []
    dq = deque()
    for r, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(r)
        if dq[0] <= r - k:
            dq.popleft()
        if r >= k - 1:
            out.append(nums[dq[0]])
    return out`,
      },
      tests: [
        { args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
        { args: [[1], 1], expected: [1] },
        { args: [[9, 8, 7, 6], 2], expected: [9, 8, 7] },
        { args: [[1, 2, 3, 4], 4], expected: [4] },
      ],
      hints: [
        'Recomputing the max per window is O(n·k). The waste is re-examining elements you already compared.',
        'If a new element is bigger than the ones behind it, those can never be the max again — drop them.',
        'Store indices, not values, so you can tell when the front has slid out of the window.',
      ],
    },
  ],
}
