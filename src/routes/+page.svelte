<script lang="ts">
	import { lowFodmap, highFodmap } from '$lib/data';
	import type { FoodItem, FodmapData } from '$lib/schema/fodmap';
	import { browser } from '$app/environment';
	import { locale, t } from '$lib/i18n';
	import LocaleToggle from '$lib/components/LocaleToggle.svelte';

	let activeTab: 'low' | 'high' = $state('low');
	let searchQuery = $state('');
	
	// Initialize dark mode with proper SSR handling
	function getInitialDarkMode(): boolean {
		if (!browser) return false;
		const stored = localStorage.getItem('darkMode');
		if (stored !== null) {
			return stored === 'true';
		}
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}
	
	let darkMode = $state(browser ? getInitialDarkMode() : false);
	let showAttribution = $state(false);

	// Apply dark mode class to document whenever darkMode changes
	$effect(() => {
		if (browser) {
			document.documentElement.classList.toggle('dark', darkMode);
			localStorage.setItem('darkMode', String(darkMode));
		}
	});

	// Initialize locale from localStorage
	$effect(() => {
		if (browser) {
			locale.init();
		}
	});

	// Update HTML lang attribute when locale changes
	$effect(() => {
		if (browser) {
			document.documentElement.lang = $locale;
		}
	});

	function toggleDarkMode() {
		darkMode = !darkMode;
	}

	function showAttributionPopover() {
		showAttribution = true;
	}

	function hideAttributionPopover() {
		showAttribution = false;
	}

	const currentData = $derived(activeTab === 'low' ? lowFodmap : highFodmap);
	const isSearchActive = $derived(searchQuery.trim().length > 0);

	function foodMatchesSearch(food: FoodItem, query: string): boolean {
		const lowerQuery = query.toLowerCase();
		if (food.name.toLowerCase().includes(lowerQuery)) return true;
		if (food.notes?.toLowerCase().includes(lowerQuery)) return true;
		if (food.variants?.some((v) => foodMatchesSearch(v, query))) return true;
		return false;
	}

	function filterFoods(foods: FoodItem[], query: string): FoodItem[] {
		return foods
			.map((food) => {
				if (food.name.toLowerCase().includes(query.toLowerCase())) {
					return food;
				}
				if (food.variants) {
					const matchingVariants = filterFoods(food.variants, query);
					if (matchingVariants.length > 0) {
						return { ...food, variants: matchingVariants };
					}
				}
				if (food.notes?.toLowerCase().includes(query.toLowerCase())) {
					return food;
				}
				return null;
			})
			.filter((food): food is FoodItem => food !== null);
	}

	function filterFodmapData(data: FodmapData, query: string): FodmapData {
		if (!query.trim()) return data;
		const filteredCategories = data.categories
			.map((category) => ({
				...category,
				foods: filterFoods(category.foods, query)
			}))
			.filter((category) => category.foods.length > 0);
		return { ...data, categories: filteredCategories };
	}

	const filteredLow = $derived(filterFodmapData(lowFodmap, searchQuery));
	const filteredHigh = $derived(filterFodmapData(highFodmap, searchQuery));
</script>

<svelte:head>
	<title>{$t('meta.title')}</title>
	<meta name="description" content={$t('meta.description')} />
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
	<header class="bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-700/50 sticky top-0 z-10 transition-colors duration-300">
		<div class="container mx-auto px-4 py-6">
			<div class="flex justify-end mb-2 gap-2">
				<!-- Locale toggle -->
				<LocaleToggle />

				<!-- Dark mode toggle -->
				<button
					onclick={toggleDarkMode}
					class="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
					aria-label={darkMode ? $t('theme.lightMode') : $t('theme.darkMode')}
				>
					{#if darkMode}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
							<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
						</svg>
					{/if}
				</button>

				<!-- Attribution button -->
				<div 
					class="relative"
					role="group"
					onmouseenter={showAttributionPopover}
					onmouseleave={hideAttributionPopover}
				>
					<button
						class="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
						aria-label={$t('attribution.label')}
						aria-expanded={showAttribution}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-600 dark:text-slate-300" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
						</svg>
					</button>
					{#if showAttribution}
						<!-- Invisible bridge to prevent gap hover issues -->
						<div class="absolute right-0 top-full h-2 w-full"></div>
						<div class="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-slate-700/50 border border-slate-200 dark:border-slate-700 p-4 z-20">
							<div class="flex items-start gap-3">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
								</svg>
								<div>
									<p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
										{$t('attribution.text')}
										<a 
											href="https://www.ibsdiets.org/fodmap-diet/fodmap-food-list/" 
											target="_blank" 
											rel="noopener noreferrer"
											class="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
										>IBS Diets</a>.
									</p>
									<p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
										{$t('attribution.thanks')}
									</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
			<h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center mb-4 transition-colors duration-300">
				{$t('header.title')}
			</h1>
			<div class="flex justify-center mb-4">
				<input
					type="search"
					placeholder={$t('search.placeholder')}
					bind:value={searchQuery}
					class="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 focus:outline-none transition-all"
				/>
			</div>
			<div class="flex justify-center gap-2" class:hidden={isSearchActive}>
				<button
					onclick={() => activeTab = 'low'}
					class="px-6 py-3 rounded-lg font-medium transition-all {activeTab === 'low' 
						? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50' 
						: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}"
				>
					{$t('tabs.low')}
				</button>
				<button
					onclick={() => activeTab = 'high'}
					class="px-6 py-3 rounded-lg font-medium transition-all {activeTab === 'high' 
						? 'bg-amber-600 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/50' 
						: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}"
				>
					{$t('tabs.high')}
				</button>
			</div>
		</div>
	</header>

	<div class="container mx-auto px-4 py-8">
		{#if isSearchActive}
			{#if filteredLow.categories.length === 0 && filteredHigh.categories.length === 0}
				<div class="text-center py-12">
					<p class="text-slate-500 dark:text-slate-400 text-lg">{$t('search.noResults', { query: searchQuery })}</p>
				</div>
			{:else}
				<div class="grid md:grid-cols-2 gap-8">
					<div>
						<h2 class="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
							{$t('search.lowMatches')}
							{#if filteredLow.categories.length > 0}
								<span class="text-base font-normal text-slate-500 dark:text-slate-400">
									({$t('items.count', { count: filteredLow.categories.reduce((acc, cat) => acc + cat.foods.length, 0) })})
								</span>
							{/if}
						</h2>
						{#if filteredLow.categories.length === 0}
							<p class="text-slate-400 dark:text-slate-500 italic">{$t('search.noLowMatches')}</p>
						{:else}
							<div class="space-y-4">
								{#each filteredLow.categories as category}
									<div class="bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-700/50 overflow-hidden transition-colors duration-300">
										<div class="px-4 py-3 bg-emerald-600 dark:bg-emerald-700">
											<h3 class="font-semibold text-white">{category.name}</h3>
										</div>
										<ul class="divide-y divide-slate-100 dark:divide-slate-700">
											{#each category.foods as food}
												{@render foodItem(food, 0, 'low')}
											{/each}
										</ul>
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<div>
						<h2 class="text-2xl font-semibold text-amber-700 dark:text-amber-400 mb-4">
							{$t('search.highMatches')}
							{#if filteredHigh.categories.length > 0}
								<span class="text-base font-normal text-slate-500 dark:text-slate-400">
									({$t('items.count', { count: filteredHigh.categories.reduce((acc, cat) => acc + cat.foods.length, 0) })})
								</span>
							{/if}
						</h2>
						{#if filteredHigh.categories.length === 0}
							<p class="text-slate-400 dark:text-slate-500 italic">{$t('search.noHighMatches')}</p>
						{:else}
							<div class="space-y-4">
								{#each filteredHigh.categories as category}
									<div class="bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-700/50 overflow-hidden transition-colors duration-300">
										<div class="px-4 py-3 bg-amber-600 dark:bg-amber-700">
											<h3 class="font-semibold text-white">{category.name}</h3>
										</div>
										<ul class="divide-y divide-slate-100 dark:divide-slate-700">
											{#each category.foods as food}
												{@render foodItem(food, 0, 'high')}
											{/each}
										</ul>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		{:else}
			<div class="mb-6 text-center">
				<h2 class="text-2xl font-semibold {activeTab === 'low' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}">
					{currentData.title}
				</h2>
				{#if currentData.notes}
					<p class="text-slate-600 dark:text-slate-400 mt-2">{currentData.notes}</p>
				{/if}
			</div>

			<div class="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:balance]">
				{#each currentData.categories as category}
					<div class="bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-700/50 overflow-hidden mb-6 break-inside-avoid transition-colors duration-300">
						<div class="px-4 py-3 {activeTab === 'low' ? 'bg-emerald-600 dark:bg-emerald-700' : 'bg-amber-600 dark:bg-amber-700'}">
							<h3 class="font-semibold text-white">{category.name}</h3>
							{#if category.notes}
								<p class="text-sm text-white/80 mt-1">{category.notes}</p>
							{/if}
						</div>
						<ul class="divide-y divide-slate-100 dark:divide-slate-700">
							{#each category.foods as food}
								{@render foodItem(food, 0, activeTab)}
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>

{#snippet foodItem(food: FoodItem, depth: number, type: 'low' | 'high')}
	<li class="px-4 py-2 transition-colors duration-150 {depth > 0 ? 'bg-slate-50 dark:bg-slate-700/50' : ''} {type === 'low' 
		? 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30' 
		: 'hover:bg-amber-100 dark:hover:bg-amber-900/30'}">
		<div class="flex items-start gap-2" style="padding-left: {depth * 16}px">
			<span class="text-slate-800 dark:text-slate-200 {depth > 0 ? 'text-sm' : ''}">{food.name}</span>
			{#if food.max_amount || food.threshold}
				<span class="shrink-0 px-2 py-0.5 text-xs rounded-full {type === 'low' 
					? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' 
					: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'}">
					{food.max_amount || food.threshold}
				</span>
			{/if}
		</div>
		{#if food.notes}
			<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5" style="padding-left: {depth * 16}px">{food.notes}</p>
		{/if}
		{#if food.variants}
			<ul class="mt-1">
				{#each food.variants as variant}
					{@render foodItem(variant, depth + 1, type)}
				{/each}
			</ul>
		{/if}
	</li>
{/snippet}
