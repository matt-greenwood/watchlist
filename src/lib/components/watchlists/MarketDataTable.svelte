<script lang="ts">
  import { watchlistStore } from '$lib/stores/watchlist.svelte';
  import type { MarketData } from '$lib/types/MarketData';

  interface Props {
    symbols: string[];
    onRemove: (symbol: string) => void;
  }

  let { symbols, onRemove }: Props = $props();
  let marketDataMap = $state(new Map<string, MarketData>());

  const loadingIndicator = 'Loading...';

  const loadMarketData = async () => {
    if (!symbols.length) return;
    
    const newMarketDataMap = new Map<string, MarketData>();
    
    for (const symbol of symbols) {
      const marketData = await watchlistStore.fetchMarketData(symbol);
      if (marketData) {
        newMarketDataMap.set(symbol, marketData);
      }
    }
    
    marketDataMap = newMarketDataMap;
  };

  $effect(() => {
    if (symbols.length > 0) {
      loadMarketData();
    }
  });
</script>

{#if symbols.length > 0}
  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <table class="min-w-full divide-y divide-gray-300">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Stock Symbol
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Bid Price
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ask Price
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Last Price
          </th>
          <th scope="col" class="relative px-6 py-3">
            <span class="sr-only">Remove</span>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each symbols as symbol}
          {@const marketData = marketDataMap.get(symbol)}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {symbol}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {marketData?.bidPrice ?? loadingIndicator}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {marketData?.askPrice ?? loadingIndicator}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {marketData?.lastPrice ?? loadingIndicator}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                type="button"
                class="text-red-600 hover:text-red-900 cursor-pointer"
                onclick={() => onRemove(symbol)}
              >
                Remove
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}