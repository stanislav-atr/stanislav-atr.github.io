import { fodmapDataSchema, type FodmapData } from '$lib/schema/fodmap';
import lowFodmapRaw from '../../data/fodmap-low.json';
import highFodmapRaw from '../../data/fodmap-high.json';

function validateFodmapData(data: unknown, source: string): FodmapData {
	const result = fodmapDataSchema.safeParse(data);
	if (!result.success) {
		console.error(`Validation failed for ${source}:`, result.error.format());
		throw new Error(`Invalid FODMAP data in ${source}: ${result.error.message}`);
	}
	return result.data;
}

export const lowFodmap: FodmapData = validateFodmapData(lowFodmapRaw, 'fodmap-low.json');
export const highFodmap: FodmapData = validateFodmapData(highFodmapRaw, 'fodmap-high.json');
