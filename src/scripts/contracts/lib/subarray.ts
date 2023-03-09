export function subarray_with_max_sum(data: number[]): number {
  const nums = data.slice();
  for (let i = 1; i < nums.length; i++) {
    nums[i] = Math.max(nums[i], nums[i] + nums[i - 1]);
  }
  return Math.max(...nums);
}
