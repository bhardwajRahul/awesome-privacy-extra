<script lang="ts">
  import { onMount } from 'svelte';

  let theme = $state('dark');

  onMount(() => {
    const storedTheme = localStorage.getItem('theme');
    theme = storedTheme || 'dark';
    applyTheme(theme);
  });

  function toggleTheme(): void {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    theme = newTheme;
    applyTheme(newTheme);
  }

  function applyTheme(selectedTheme: string): void {
    document.documentElement.setAttribute('data-theme', selectedTheme);
  }
</script>

<button
  class="theme-switcher"
  onclick={toggleTheme}
  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
>
  <div class={`toggle ${theme}`}>
    <span class="theme-icon">🌘</span>
    <span class="theme-icon">☀️</span>
  </div>
</button>

<style lang="scss">
  .theme-switcher {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: var(--border-heavy);
    border-radius: var(--curve-lg);
    padding: var(--space-xs);
    background-color: rgba(255, 255, 255, 0.2);
    transition: background-color 0.3s ease;
    box-shadow: var(--shadow-sm);

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }

  .toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 4rem;
    height: 2rem;
    background: var(--accent-fg);
    border-radius: var(--curve-lg);
    padding: var(--space-xs);
    position: relative;
    transition: background 0.3s ease;

    &::before {
      content: '';
      position: absolute;
      top: var(--space-xs);
      left: var(--space-xs);
      width: 1.6rem;
      height: 1.6rem;
      border-radius: 50%;
      background: var(--background);
      opacity: var(--opacity-muted);
      transition: transform 0.3s ease;
    }

    &.dark::before {
      transform: translateX(0);
    }

    &:not(.dark)::before {
      transform: translateX(2.2rem);
    }
  }

  .theme-icon {
    display: flex;
    font-size: 1.5rem;
  }
</style>
