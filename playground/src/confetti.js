// import confetti from "/node_modules/canvas-confetti/dist/confetti.module.mjs";
import confetti from "canvas-confetti";

export const setupConfetti = (element) => {
  console.log("Hello Simple Bundle Playground!");

  const setConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };
  setConfetti();
  element.addEventListener("click", () => setConfetti());
};
