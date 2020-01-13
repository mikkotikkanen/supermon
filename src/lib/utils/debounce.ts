export default (func: Function, delay: number) => {
  let inDebounce: NodeJS.Timeout;

  return function () {
    const args = arguments;
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func.apply(null, args), delay);
  };
};
