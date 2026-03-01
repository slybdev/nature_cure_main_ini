/*
  NATURE CURES INITIATIVE - DEMO PRODUCTS SEED DATA
  Run this in your Supabase SQL Editor to populate the products table.
*/

INSERT INTO public.products (
  name, 
  slug, 
  short_description, 
  full_description, 
  ingredients, 
  usage_instructions, 
  price, 
  stock_quantity, 
  category, 
  image_url, 
  is_featured
) VALUES 
(
  'Detox Herbal Tea', 
  'detox-herbal-tea', 
  'A powerful blend of cleansing herbs to rejuvenate your system.', 
  'Our Detox Herbal Tea is meticulously crafted to support your body''s natural detoxification processes. This refreshing blend combines traditional African herbs known for their purifying properties, helping to clear toxins and restore internal balance.', 
  'Dandelion Root, Ginger, Turmeric, Lemon Peel, Peppermint, Burdock Root.', 
  'Steep one tea bag in hot water for 5-7 minutes. For best results, drink one cup every morning on an empty stomach.', 
  4500.00, 
  100, 
  'Herbal Tea', 
  'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=800', 
  true
),
(
  'Immune Support Capsules', 
  'immune-support-capsules', 
  'High-potency herbal supplement to strengthen your natural defenses.', 
  'Formulated with a concentrated blend of immune-boosting botanicals, these capsules provide year-round support for your immune system. Rich in antioxidants and essential nutrients to keep you resilient.', 
  'Echinacea, Elderberry Extract, Vitamin C (from Acerola Cherry), Zinc, Garlic Extract.', 
  'Take two capsules daily with a meal and a full glass of water.', 
  8500.00, 
  50, 
  'Supplements', 
  'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=800', 
  true
),
(
  'Lavender Essential Oil', 
  'lavender-essential-oil', 
  'Pure, therapeutic-grade lavender oil for relaxation and sleep.', 
  'Experience the calming essence of pure lavender. Our essential oil is steam-distilled to preserve its therapeutic properties, making it perfect for aromatherapy, stress relief, and promoting restful sleep.', 
  '100% Pure Lavandula Angustifolia (Lavender) Oil.', 
  'Add 3-5 drops to a diffuser, or dilute with a carrier oil for topical application to temples and wrists.', 
  3200.00, 
  75, 
  'Essential Oils', 
  'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=800', 
  false
),
(
  'Digestive Support Tincture', 
  'digestive-support-tincture', 
  'Fast-acting liquid extract to soothe bloating and support gut health.', 
  'A concentrated liquid extract designed to provide rapid relief from digestive discomfort. This tincture helps stimulate healthy digestion and reduces bloating after meals.', 
  'Fennel Seed, Gentian Root, Chamomile, Artichoke Leaf, Vegetable Glycerin.', 
  'Add 20-30 drops to a small amount of water or juice. Take up to 3 times daily, preferably before meals.', 
  5800.00, 
  40, 
  'Tinctures', 
  'https://images.unsplash.com/photo-1615485242217-10645f6991c7?auto=format&fit=crop&q=80&w=800', 
  true
),
(
  'Vitality Herbal Blend', 
  'vitality-herbal-blend', 
  'Natural energy booster to combat fatigue and improve focus.', 
  'Reclaim your energy with our Vitality Herbal Blend. This potent combination of adaptogenic herbs helps your body manage stress while providing a clean, sustainable energy boost without the crash of caffeine.', 
  'Ashwagandha, Ginseng, Moringa, Maca Root, Green Tea Extract.', 
  'Mix one teaspoon into your favorite smoothie, juice, or warm water daily.', 
  7200.00, 
  60, 
  'Supplements', 
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800', 
  false
),
(
  'Soothing Sleep Tea', 
  'soothing-sleep-tea', 
  'A gentle evening blend to help you drift into deep, restful sleep.', 
  'Unwind after a long day with our Soothing Sleep Tea. This caffeine-free blend uses traditional sleep-inducing herbs to calm the mind and prepare the body for a restorative night''s rest.', 
  'Chamomile, Valerian Root, Lemon Balm, Passionflower, Lavender Flowers.', 
  'Steep one tea bag in hot water for 10 minutes before bedtime.', 
  4200.00, 
  120, 
  'Herbal Tea', 
  'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800', 
  true
);
