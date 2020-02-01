export function calculateDisplay(countdown, now) {
  const step = 1000;
  const tolerance = 200;
  const adjustment = 2;

  const delta = Math.max(0, (new Date(countdown.ending)).getTime() - now);
  const correction = Math.ceil((delta - tolerance) / step) * step;
  const next = Math.max(step + delta - correction - adjustment, 0);
  return {
    display: getTimerString(correction),
    delay: next,
  };
}

export function getTimerString(timer) {
  let arr = [24, 60, 60, 1000];
  for (let i = arr.length - 1; i > 0; i--) arr[i - 1] *= arr[i];

  arr = arr.map(x => ({
    millis: x,
    count: 0,
  }));

  const consumed = () => arr
    .reduce((acc, val) => acc + (val.millis * val.count), 0);

  arr.forEach(x => {
    x.count = Math.floor((timer - consumed()) / x.millis)
  });

  while (!arr[0].count && arr.length > 2) arr.shift();

  return arr.map(x => pad(x.count.toString(10))).join(':');
}

export function pad(string, length = 2) {
  return (length <= string.length) ? string : pad('0' + string, length);
}

export function dateToString(date) {
  return `${date.getFullYear()}-${pad((date.getMonth() + 1).toString())}-${pad((date.getDate()).toString())}`;
}

export function dateToTimeString(date) {
  return `${pad(date.getHours().toString())}:${pad(date.getMinutes().toString())}`;
}

export function parseInputDate(string) {
  const a = string.split('-');
  return new Date(a[0], a[1] - 1, a[2]);
}

export function parseInputDateTime(date, time) {
  const d = date.split('-');
  const t = time.split(':');
  return new Date(d[0], d[1] - 1, d[2], t[0], t[1]);
}