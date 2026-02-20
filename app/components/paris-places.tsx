import { PlaceCard } from "@/app/components/place-card";

const places = [
  {
    name: "Eiffel Tower",
    description:
      "An iconic wrought-iron lattice tower standing 330 metres tall on the Champ de Mars. Built for the 1889 World's Fair, it offers breathtaking panoramic views of the entire city from its three observation levels.",
    imageSrc:
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop",
    imageAlt:
      "The Eiffel Tower seen from the Champ de Mars gardens on a sunny day",
    location: "7th arrondissement",
  },
  {
    name: "Louvre Museum",
    description:
      "The world's largest and most-visited art museum, housed in a historic palace along the Seine. Home to masterpieces like the Mona Lisa and the Venus de Milo, its vast collection spans thousands of years of art and history.",
    imageSrc:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop",
    imageAlt:
      "The Louvre Museum with its iconic glass pyramid and classical architecture",
    location: "1st arrondissement",
  },
  {
    name: "Montmartre & Sacre-Coeur",
    description:
      "A charming hilltop neighbourhood crowned by the striking white-domed Basilica of the Sacred Heart. Wander cobblestone streets once home to Picasso and Monet, and enjoy sweeping views of Paris from the basilica's steps.",
    imageSrc:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
    imageAlt:
      "The Sacre-Coeur Basilica atop Montmartre hill with cobblestone streets below",
    location: "18th arrondissement",
  },
];

export function ParisPlaces() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Travel Guide
        </p>
        <h1 className="text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
          Three Places to Visit in Paris
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-balance text-gray-600 dark:text-gray-400 leading-relaxed">
          From world-famous landmarks to bohemian neighbourhoods, here are three
          destinations that capture the magic of the City of Light.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <PlaceCard key={place.name} {...place} />
        ))}
      </div>
    </section>
  );
}
