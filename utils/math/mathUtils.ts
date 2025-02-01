import { create, all, MathJsStatic } from "mathjs";

// Inisialisasi Math.js dengan semua fungsi yang tersedia
const math: MathJsStatic = create(all, {});

// Tambahkan fungsi kustom jika diperlukan
math.import(
  {
    //Rata-rata
    mean: function (...args: number[]) {
      if (args.length === 0) return 0;
      const sum = args.reduce((a, b) => a + b, 0);
      return sum / args.length;
    },
    //standar deviasi
    // stddev: function (...args: number[]) {
    //   if (args.length === 0) return 0;
    //   const mean = args.reduce((a, b) => a + b, 0) / args.length;
    //   const variance =
    //     args.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / args.length;
    //   return Math.sqrt(variance);
    // },
    // "**": (a, b) => Math.pow(a, b),
  },
  { override: true }
);

export default math;
