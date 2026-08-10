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
    {
      id: 'remove-duplicates',
      title: 'Remove duplicates from a sorted array',
      difficulty: 'easy',
      prompt: 'Given a sorted array, return the distinct values in order.',
      trick: 'One pointer reads, a slower one writes. The write index is the answer length.',
      fn: { js: 'removeDuplicates', py: 'remove_duplicates' },
      stub: { js: `function removeDuplicates(nums) {\n  \n}`, py: `def remove_duplicates(nums):\n    pass` },
      solution: {
        js: `function removeDuplicates(nums) {
  let w = 0
  for (let r = 0; r < nums.length; r++) {
    if (w === 0 || nums[r] !== nums[w - 1]) nums[w++] = nums[r]
  }
  return nums.slice(0, w)
}`,
        py: `def remove_duplicates(nums):
    w = 0
    for r in range(len(nums)):
        if w == 0 or nums[r] != nums[w - 1]:
            nums[w] = nums[r]
            w += 1
    return nums[:w]`,
      },
      tests: [
        { args: [[1, 1, 2]], expected: [1, 2] },
        { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: [0, 1, 2, 3, 4] },
        { args: [[]], expected: [] },
        { args: [[1]], expected: [1] },
        { args: [[2, 2, 2, 2]], expected: [2] },
      ],
      hints: [
        'The two pointers here do not start at opposite ends. They both move left to right at different speeds.',
        'One pointer scans every element. The other marks where the next kept value belongs.',
        'Compare against the last value you *wrote*, not the previous value you read.',
      ],
    },
    {
      id: 'sorted-squares',
      title: 'Squares of a sorted array',
      difficulty: 'easy',
      prompt:
        'Given an array sorted ascending that may contain negatives, return the squares of each number, sorted ascending.',
      trick: 'The largest square is at one end or the other, so fill the output from the back.',
      fn: { js: 'sortedSquares', py: 'sorted_squares' },
      stub: { js: `function sortedSquares(nums) {\n  \n}`, py: `def sorted_squares(nums):\n    pass` },
      solution: {
        js: `function sortedSquares(nums) {
  const out = new Array(nums.length)
  let l = 0, r = nums.length - 1
  for (let i = nums.length - 1; i >= 0; i--) {
    const a = nums[l] * nums[l], b = nums[r] * nums[r]
    if (a > b) { out[i] = a; l++ } else { out[i] = b; r-- }
  }
  return out
}`,
        py: `def sorted_squares(nums):
    out = [0] * len(nums)
    l, r = 0, len(nums) - 1
    for i in range(len(nums) - 1, -1, -1):
        a, b = nums[l] ** 2, nums[r] ** 2
        if a > b:
            out[i] = a
            l += 1
        else:
            out[i] = b
            r -= 1
    return out`,
      },
      tests: [
        { args: [[-4, -1, 0, 3, 10]], expected: [0, 1, 9, 16, 100] },
        { args: [[-7, -3, 2, 3, 11]], expected: [4, 9, 9, 49, 121] },
        { args: [[0]], expected: [0] },
        { args: [[-5, -3, -1]], expected: [1, 9, 25] },
      ],
      hints: [
        'Sorting the squares is O(n log n). The input is already sorted — where do the biggest squares live?',
        'At the two ends. The middle holds the values closest to zero.',
        'Write the output back-to-front, taking the larger of the two ends each time.',
      ],
    },
    {
      id: 'reverse-vowels',
      title: 'Reverse only the vowels',
      difficulty: 'easy',
      prompt: 'Reverse the order of the vowels in a string, leaving every other character where it is.',
      trick: 'Two pointers that both skip consonants, then swap and step inward.',
      fn: { js: 'reverseVowels', py: 'reverse_vowels' },
      stub: { js: `function reverseVowels(s) {\n  \n}`, py: `def reverse_vowels(s):\n    pass` },
      solution: {
        js: `function reverseVowels(s) {
  const vowels = new Set('aeiouAEIOU')
  const a = [...s]
  let l = 0, r = a.length - 1
  while (l < r) {
    while (l < r && !vowels.has(a[l])) l++
    while (l < r && !vowels.has(a[r])) r--
    const tmp = a[l]; a[l] = a[r]; a[r] = tmp
    l++
    r--
  }
  return a.join('')
}`,
        py: `def reverse_vowels(s):
    vowels = set('aeiouAEIOU')
    a = list(s)
    l, r = 0, len(a) - 1
    while l < r:
        while l < r and a[l] not in vowels:
            l += 1
        while l < r and a[r] not in vowels:
            r -= 1
        a[l], a[r] = a[r], a[l]
        l += 1
        r -= 1
    return ''.join(a)`,
      },
      tests: [
        { args: ['hello'], expected: 'holle' },
        { args: ['leetcode'], expected: 'leotcede' },
        { args: ['aA'], expected: 'Aa' },
        { args: [''], expected: '' },
        { args: ['xyz'], expected: 'xyz' },
      ],
      hints: [
        'Same shape as valid palindrome: two ends walking in, each skipping characters it does not care about.',
        'Strings are immutable in both languages — work on an array of characters and join at the end.',
        'Uppercase vowels count too, and the skip loops need the l < r guard.',
      ],
    },
    {
      id: 'three-sum',
      title: '3Sum',
      difficulty: 'medium',
      prompt:
        'Return every unique triplet in the array that sums to zero. Each triplet ascending, and the list ordered as the sorted scan finds them.',
      trick: 'Sort, fix the first number, then it is two-sum on the rest.',
      fn: { js: 'threeSum', py: 'three_sum' },
      stub: { js: `function threeSum(nums) {\n  \n}`, py: `def three_sum(nums):\n    pass` },
      solution: {
        js: `function threeSum(nums) {
  const a = [...nums].sort((x, y) => x - y)
  const out = []
  for (let i = 0; i < a.length - 2; i++) {
    if (i > 0 && a[i] === a[i - 1]) continue
    let l = i + 1, r = a.length - 1
    while (l < r) {
      const sum = a[i] + a[l] + a[r]
      if (sum === 0) {
        out.push([a[i], a[l], a[r]])
        while (l < r && a[l] === a[l + 1]) l++
        while (l < r && a[r] === a[r - 1]) r--
        l++
        r--
      } else if (sum < 0) l++
      else r--
    }
  }
  return out
}`,
        py: `def three_sum(nums):
    a = sorted(nums)
    out = []
    for i in range(len(a) - 2):
        if i > 0 and a[i] == a[i - 1]:
            continue
        l, r = i + 1, len(a) - 1
        while l < r:
            s = a[i] + a[l] + a[r]
            if s == 0:
                out.append([a[i], a[l], a[r]])
                while l < r and a[l] == a[l + 1]:
                    l += 1
                while l < r and a[r] == a[r - 1]:
                    r -= 1
                l += 1
                r -= 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    return out`,
      },
      tests: [
        { args: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]] },
        { args: [[0, 1, 1]], expected: [] },
        { args: [[0, 0, 0]], expected: [[0, 0, 0]] },
        { args: [[0, 0, 0, 0]], expected: [[0, 0, 0]] },
        { args: [[-2, 0, 1, 1, 2]], expected: [[-2, 0, 2], [-2, 1, 1]] },
      ],
      hints: [
        'Three nested loops is O(n³). If you sort first, what does fixing the first element reduce the rest to?',
        'For each i, run two pointers over the subarray to its right looking for -a[i].',
        'Uniqueness is the fiddly half: skip duplicate values for i, and skip duplicates on both pointers after recording a hit.',
      ],
    },
    {
      id: 'sort-colors',
      title: 'Sort Colors (Dutch national flag)',
      difficulty: 'medium',
      prompt: 'Sort an array containing only 0, 1 and 2 in a single pass. Return the sorted array.',
      trick: 'Three pointers: everything before low is 0, after high is 2, and mid does the walking.',
      fn: { js: 'sortColors', py: 'sort_colors' },
      stub: { js: `function sortColors(nums) {\n  \n}`, py: `def sort_colors(nums):\n    pass` },
      solution: {
        js: `function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1
  while (mid <= high) {
    if (nums[mid] === 0) {
      const t = nums[low]; nums[low] = nums[mid]; nums[mid] = t
      low++
      mid++
    } else if (nums[mid] === 2) {
      const t = nums[mid]; nums[mid] = nums[high]; nums[high] = t
      high--
    } else {
      mid++
    }
  }
  return nums
}`,
        py: `def sort_colors(nums):
    low = mid = 0
    high = len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 2:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
        else:
            mid += 1
    return nums`,
      },
      tests: [
        { args: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2] },
        { args: [[2, 0, 1]], expected: [0, 1, 2] },
        { args: [[0]], expected: [0] },
        { args: [[2, 2, 1, 1, 0, 0]], expected: [0, 0, 1, 1, 2, 2] },
      ],
      hints: [
        'Counting each value and rewriting works in two passes. One pass needs partitioning instead.',
        'Keep three regions: settled 0s at the front, settled 2s at the back, unknown in the middle.',
        'After swapping a 2 into place do NOT advance mid — the value you swapped in is still unexamined.',
      ],
    },
    {
      id: 'trapping-rain-water',
      title: 'Trapping Rain Water',
      difficulty: 'hard',
      prompt: 'Given an elevation map, return how much water it can trap after raining.',
      trick: 'Water above a column is set by the smaller of the tallest walls either side, so advance the shorter side.',
      fn: { js: 'trap', py: 'trap' },
      stub: { js: `function trap(height) {\n  \n}`, py: `def trap(height):\n    pass` },
      solution: {
        js: `function trap(height) {
  let l = 0, r = height.length - 1
  let leftMax = 0, rightMax = 0, total = 0
  while (l < r) {
    if (height[l] < height[r]) {
      leftMax = Math.max(leftMax, height[l])
      total += leftMax - height[l]
      l++
    } else {
      rightMax = Math.max(rightMax, height[r])
      total += rightMax - height[r]
      r--
    }
  }
  return total
}`,
        py: `def trap(height):
    l, r = 0, len(height) - 1
    left_max = right_max = total = 0
    while l < r:
        if height[l] < height[r]:
            left_max = max(left_max, height[l])
            total += left_max - height[l]
            l += 1
        else:
            right_max = max(right_max, height[r])
            total += right_max - height[r]
            r -= 1
    return total`,
      },
      tests: [
        { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
        { args: [[4, 2, 0, 3, 2, 5]], expected: 9 },
        { args: [[]], expected: 0 },
        { args: [[3, 3, 3]], expected: 0 },
        { args: [[5, 0, 5]], expected: 5 },
      ],
      hints: [
        'Water over one column is min(tallest to the left, tallest to the right) minus its own height.',
        'Precomputing both maxima is O(n) space. Two pointers get it in O(1) — but only if you move the right one.',
        'If height[l] < height[r], then leftMax is definitely the binding constraint for column l, so it is safe to settle l and advance it.',
      ],
    },
  ],
}
