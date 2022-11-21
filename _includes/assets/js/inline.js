let doesPreferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches;

if (doesPreferDark) {
  document.documentElement.classList.add('dark-theme');
}

document.addEventListener('DOMContentLoaded', function (event) {
  const colorThemeSwitch = document.getElementById('color-theme-switch');
  const lightIcon = colorThemeSwitch.getElementsByClassName('light')[0];
  const darkIcon = colorThemeSwitch.getElementsByClassName('dark')[0];

  if (doesPreferDark) {
    darkIcon.style.display = 'flex';
  } else {
    lightIcon.style.display = 'flex';
  }

  window.toggleColorTheme = () => {
    if (document.documentElement.classList.contains('dark-theme')) {
      document.documentElement.classList.remove('dark-theme');
      darkIcon.style.display = 'none';
      lightIcon.style.display = 'flex';
    } else {
      document.documentElement.classList.add('dark-theme');
      lightIcon.style.display = 'none';
      darkIcon.style.display = 'flex';
    }
  };
});
