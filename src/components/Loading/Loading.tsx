import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center animate-bounce">
      <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/1.svg"
        alt="loading"
        className="opacity-60 w-32 h-32"
      />
    </div>
  );
}
