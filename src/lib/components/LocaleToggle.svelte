<script lang="ts">
	import { locale, locales, t, type Locale } from '$lib/i18n';
	import flagEn from '$assets/icons/locale/en.svg';
	import flagRu from '$assets/icons/locale/ru.svg';
	import flagKz from '$assets/icons/locale/kz.svg';

	let showDropdown = $state(false);

	function showMenu() {
		showDropdown = true;
	}

	function hideMenu() {
		showDropdown = false;
	}

	function selectLocale(loc: Locale) {
		locale.set(loc);
		showDropdown = false;
	}

	const flags: Record<Locale, string> = {
		en: flagEn,
		ru: flagRu,
		kz: flagKz
	};
</script>

<div
	class="relative"
	role="group"
	onmouseenter={showMenu}
	onmouseleave={hideMenu}
>
	<button
		class="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 flex items-center"
		aria-label={$t('locale.label')}
		aria-expanded={showDropdown}
		aria-haspopup="true"
	>
		<img
			src={flags[$locale]}
			alt=""
			class="h-5 w-5 rounded-sm shadow-sm object-cover"
		/>
	</button>

	{#if showDropdown}
		<!-- Invisible bridge to prevent gap hover issues -->
		<div class="absolute right-0 top-full h-2 w-full"></div>
		<div class="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-slate-700/50 border border-slate-200 dark:border-slate-700 py-1 z-20 min-w-[3rem]">
			{#each locales as loc}
				<button
					onclick={() => selectLocale(loc)}
					class="w-full px-3 py-2 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors {$locale === loc ? 'bg-slate-50 dark:bg-slate-700/50' : ''}"
					aria-current={$locale === loc ? 'true' : undefined}
				>
					<img
						src={flags[loc]}
						alt=""
						class="h-6 w-8 rounded-sm shadow-sm object-cover"
					/>
				</button>
			{/each}
		</div>
	{/if}
</div>
