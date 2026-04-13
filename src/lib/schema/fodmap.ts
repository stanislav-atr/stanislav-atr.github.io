import { z } from 'zod';

const baseFoodSchema = z.object({
	name: z.string(),
	notes: z.string().optional(),
	threshold: z.string().optional(),
	max_amount: z.string().optional()
});

type Food = z.infer<typeof baseFoodSchema> & {
	variants?: Food[];
};

const foodSchema: z.ZodType<Food> = baseFoodSchema.extend({
	variants: z.lazy(() => foodSchema.array().optional())
});

const categorySchema = z.object({
	name: z.string(),
	notes: z.string().optional(),
	foods: z.array(foodSchema)
});

export const fodmapDataSchema = z.object({
	title: z.string(),
	notes: z.string().optional(),
	categories: z.array(categorySchema)
});

export type FodmapData = z.infer<typeof fodmapDataSchema>;
export type Category = z.infer<typeof categorySchema>;
export type FoodItem = Food;
