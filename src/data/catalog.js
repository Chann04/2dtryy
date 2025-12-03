export const catalog = [
    {
      id: "coats",
      label: "Coats",
      variants: [
        { id: "double-breasted", name: "Double Breasted Coat" },
        { id: "trench", name: "Modern Trench Coat" }
      ]
    },
    {
      id: "suits",
      label: "Suits",
      variants: [
        { id: "double-breasted", name: "Double Breasted Suit" },
        { id: "tuxedo", name: "Evening Tuxedo" }
      ]
    },
    {
      id: "barong",
      label: "Barong Tagalog",
      genderLocked: "male",
      allowedFabrics: ["piña", "organza"],
      variants: [
        { id: "classic", name: "Classic Barong" }
      ]
    },
    {
      id: "trousers",
      label: "Trousers",
      variants: [
        { id: "formal", name: "Formal Trousers" },
        { id: "wideleg", name: "Wide Leg Trousers" }
      ]
    }
  ];
  