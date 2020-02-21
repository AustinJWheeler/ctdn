export const fetchCountdowns = (key = null) => {
  return fetch('/api/countdowns' + (key ? '/' + key : ''))
    .then(x => x.json())
    .then(x => (key ? [x] : x));
};
export const fetchCountdown = key => {
  return fetch('/api/countdowns/' + key).then(x => x.json());
};