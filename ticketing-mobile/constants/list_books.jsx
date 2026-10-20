const ListBook = [
  {
    id: 1, // number (unique id)
    title: "Testing Book Title",
    img: require("@/assets/images/avatar.png"),
    author: "Testing Author",
    rating: 5, // number (1-5)
    views: 1000,
    is_free: true, // boolean
    sinopsis: "Sinopsis singkat buku...",
    story: "Isi cerita buku...",
  },
  {
    id: 2,
    title: "Another Testing Book",
    img: require("@/assets/images/avatar.png"),
    author: "Another Testing Author",
    rating: 4,
    views: 500,
    is_free: false,
    sinopsis: "Another short synopsis...",
    story: "Another story content...",
  },
  {
    id: 3,
    title: "Yet Another Testing Book",
    img: require("@/assets/images/avatar.png"),
    author: "Yet Another Testing Author",
    rating: 3,
    views: 250,
    is_free: true,
    sinopsis: "Yet another short synopsis...",
    story: "Yet another story content...",
  },

];

export { ListBook };
