import type { Pattern } from './types.ts'

export const twoPointers: Pattern = {
  id: 'two-pointers',
  name: 'Two Pointers',
  trigger: 'A sorted array (or one you can sort) where you need a pair, and a nested loop would be O(n²).',
  cues: [
    'The input is sorted, or sorting it loses nothing.',
    'You need two positions, not one — a pair, a range, a partition.',
    'Moving one end can only ever push the answer one way. That monotonicity is what makes it safe to throw away half the options.',
    'The brute force is two nested loops over the same array.',
  ],
  traps: [
    'while (l < r), not l <= r — a pointer pair of one element is not a pair.',
    'Advance at least one pointer on every iteration or you loop forever.',
    'Comparing values but returning indices — decide which the problem wants before you write it.',
    'Sorting destroys original indices. If the answer needs them, sort pairs of (value, index).',
  ],
  complexity: 'O(n) after sorting · O(1) extra space',
  template: {
    js: `let l = 0, r = nums.length - 1
while (l < r) {
  const sum = nums[l] + nums[r]
  if (sum === target) return [l, r]
  if (sum < target) l++      // need bigger — only the left can grow it
  else r--                   // need smaller — only the right can shrink it
}`,
    py: `l, r = 0, len(nums) - 1
while l < r:
    s = nums[l] + nums[r]
    if s == target:
        return [l, r]
    if s < target:
        l += 1      # need bigger — only the left can grow it
    else:
        r -= 1      # need smaller — only the right can shrink it`,
  },
  problems: [
    {
      id: 'two-sum-sorted',
      title: 'Two Sum II — sorted input',
      difficulty: 'easy',
      prompt:
        'Given a sorted array of integers and a target, return the two 0-based indices whose values add to the target. Exactly one solution exists. Return [] if none.',
      trick: 'Start wide, then squeeze: too small moves the left in, too big moves the right in.',
      fn: { js: 'twoSumSorted', py: 'two_sum_sorted' },
      stub: {
        js: `function twoSumSorted(nums, target) {\n  \n}`,
        py: `def two_sum_sorted(nums, target):\n    pass`,
      },
      solution: {
        js: `function twoSumSorted(nums, target) {
  let l = 0, r = nums.length - 1
  while (l < r) {
    const sum = nums[l] + nums[r]
    if (sum === target) return [l, r]
    if (sum < target) l++
    else r--
  }
  return []
}`,
        py: `def two_sum_sorted(nums, target):
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l, r]
        if s < target:
            l += 1
        else:
            r -= 1
    return []`,
      },
      tests: [
        { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { args: [[1, 3, 4, 5, 7, 10, 11], 9], expected: [2, 3] },
        { args: [[1, 2], 3], expected: [0, 1] },
        { args: [[5, 25, 75], 100], expected: [1, 2] },
        { args: [[1, 2, 3], 99], expected: [] },
      ],
      hints: [
        'A nested loop is O(n²). What does the array being *sorted* let you rule out that an unsorted one would not?',
        'Put one pointer at each end. Look at the sum. If it is too small, which pointer could possibly help?',
        'Too small → move left inward (only way to increase). Too big → move right inward. Stop when they meet.',
      ],
    },
    {
      id: 'valid-palindrome',
      title: 'Valid Palindrome',
      difficulty: 'easy',
      prompt:
        'Return true if the string reads the same forwards and backwards, considering only alphanumeric characters and ignoring case.',
      trick: 'Walk in from both ends, skipping junk, comparing lowercased.',
      fn: { js: 'isPalindrome', py: 'is_palindrome' },
      stub: {
        js: `function isPalindrome(s) {\n  \n}`,
        py: `def is_palindrome(s):\n    pass`,
      },
      solution: {
        js: `function isPalindrome(s) {
  const ok = (c) => /[a-z0-9]/i.test(c)
  let l = 0, r = s.length - 1
  while (l < r) {
    while (l < r && !ok(s[l])) l++
    while (l < r && !ok(s[r])) r--
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false
    l++
    r--
  }
  return true
}`,
        py: `def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1
        while l < r and not s[r].isalnum():
            r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l += 1
        r -= 1
    return True`,
      },
      tests: [
        { args: ['A man, a plan, a canal: Panama'], expected: true },
        { args: ['race a car'], expected: false },
        { args: [''], expected: true },
        { args: ['0P'], expected: false },
        { args: ['.,'], expected: true },
        { args: ['ab_a'], expected: true },
      ],
      hints: [
        'Reversing the cleaned string works and is O(n) space. The two-pointer version needs none — how?',
        'Two pointers, but each one may have to skip several non-alphanumeric characters before it can compare.',
        'Guard the skip loops with l < r too, or a string of pure punctuation walks off the end.',
      ],
    },
    {
      id: 'container-most-water',
      title: 'Container With Most Water',
      difficulty: 'medium',
      prompt:
        'Each element is a vertical line height at that index. Pick two lines that, with the x-axis, hold the most water. Return that area.',
      trick: 'Widest first, then always abandon the shorter wall — it can never help again.',
      fn: { js: 'maxArea', py: 'max_area' },
      stub: {
        js: `function maxArea(height) {\n  \n}`,
        py: `def max_area(height):\n    pass`,
      },
      solution: {
        js: `function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0
  while (l < r) {
    best = Math.max(best, Math.min(height[l], height[r]) * (r - l))
    if (height[l] < height[r]) l++
    else r--
  }
  return best
}`,
        py: `def max_area(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        best = max(best, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best`,
      },
      tests: [
        { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
        { args: [[1, 1]], expected: 1 },
        { args: [[4, 3, 2, 1, 4]], expected: 16 },
        { args: [[1, 2, 1]], expected: 2 },
        { args: [[2, 3, 4, 5, 18, 17, 6]], expected: 17 },
      ],
      hints: [
        'Area is min(left, right) × distance. Start as wide as possible — that maximises one of the two factors.',
        'Moving either pointer always loses width. So the move is only worth it if height can go up.',
        'The shorter wall caps the area. Keeping it and shrinking width can never beat what you just measured, so move the shorter one.',
      ],
    },
  ],
}
