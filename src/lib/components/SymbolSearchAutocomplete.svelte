<script lang="ts">
  import { watchlistStore } from '$lib/stores/watchlist.svelte';
  import type { SymbolSearchResult } from '$lib/types/SymbolSearchResult';

  interface Props {
    onSymbolSelect: (symbol: string) => void;
  }

  let { onSymbolSelect }: Props = $props();
  let searchQuery = $state('');
  let searchResults = $state<SymbolSearchResult[]>([]);
  let isSearching = $state(false);
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  let showResults = $state(false);
  let selectedIndex = $state(-1);
  let dropdownElement = $state<HTMLDivElement>();
  let hasSelection = $state(false);

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    searchQuery = target.value;

    // Clear any previously selected value when user starts typing
    if (hasSelection) {
      onSymbolSelect('');
      hasSelection = false;
    }

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!searchQuery.trim()) {
      searchResults = [];
      showResults = false;
      selectedIndex = -1;
      return;
    }

    isSearching = true;
    searchTimeout = setTimeout(async () => {
      const results = await watchlistStore.searchSymbols(searchQuery);
      searchResults = results;
      showResults = results.length > 0;
      selectedIndex = -1;
      isSearching = false;
    }, 300);
  };

  const handleResultClick = (result: SymbolSearchResult) => {
    searchQuery = result.symbol;
    showResults = false;
    hasSelection = true;
    onSymbolSelect(result.symbol);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      showResults = true;
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      showResults = false;
    }, 200);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showResults) {
        // If dropdown is open, close it and prevent modal from closing
        e.stopPropagation();
        showResults = false;
        selectedIndex = -1;
      }
      // If dropdown is already closed, let the event bubble up to close the modal
      return;
    }

    if (e.key === 'Tab') {
      // Close dropdown and let tab proceed naturally to next focusable element
      showResults = false;
      selectedIndex = -1;
      return;
    }

    if (!showResults || searchResults.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = selectedIndex < searchResults.length - 1 ? selectedIndex + 1 : 0;
      scrollToSelectedOption();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : searchResults.length - 1;
      scrollToSelectedOption();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleResultClick(searchResults[selectedIndex]);
      }
    }
  };

  const scrollToSelectedOption = () => {
    if (selectedIndex >= 0 && dropdownElement) {
      const selectedButton = dropdownElement.querySelector(`button:nth-child(${selectedIndex + 1})`) as HTMLButtonElement;
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  };
</script>

<div class="relative">
  <label for="symbol-search" class="block text-sm font-medium leading-6 text-gray-900">
    Search for a symbol
  </label>
  
  <div class="relative mt-2">
    <input
      id="symbol-search"
      type="text"
      placeholder="Type a symbol (e.g., AAPL, TSLA)"
      class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
      value={searchQuery}
      oninput={handleInput}
      onfocus={handleInputFocus}
      onblur={handleInputBlur}
      onkeydown={handleKeydown}
    />
    
    {#if isSearching}
      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
        <div class="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    {/if}
  </div>

  {#if showResults && searchResults.length > 0}
    <div bind:this={dropdownElement} class="absolute z-[60] mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
      {#each searchResults as result, index}
        <button
          type="button"
          class="w-full text-left relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white focus:outline-none {selectedIndex === index ? 'bg-blue-600 text-white' : ''}"
          onclick={() => handleResultClick(result)}
          onmouseenter={() => selectedIndex = index}
        >
          <div class="flex items-center">
            <span class="font-medium block truncate">{result.symbol}</span>
          </div>
          {#if result.description}
            <span class="block text-xs opacity-75 truncate">{result.description}</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if showResults && searchResults.length === 0 && !isSearching && searchQuery.trim()}
    <div class="absolute z-[60] mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5">
      <div class="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-700">
        No symbols found for "{searchQuery}"
      </div>
    </div>
  {/if}
</div>