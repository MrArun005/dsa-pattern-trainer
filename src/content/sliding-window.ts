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
  ],
}
