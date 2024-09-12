export const updateDarkPatternState = () => {
  const params = new URLSearchParams(document.location.href.split('?')[1]);
  if (params) {
    if (params.get('enabled') === 'true') {
      localStorage.setItem('dark', true);
    } else if (params.get('enabled') === 'false') {
      localStorage.removeItem('dark');
    }
  }
};
