const MAX_NUMBER_LEN = Math.floor(Math.log10(Number.MAX_SAFE_INTEGER));
const MAX_NUM = 10 ** MAX_NUMBER_LEN - 1;

export const uniqueCounter = (() => {
  let mutableNum = 0;

  return () => {
    if (mutableNum >= MAX_NUM) {
      mutableNum = 0;
    }
    return (mutableNum++).toString().padStart(MAX_NUMBER_LEN, '0');
  };
})();
