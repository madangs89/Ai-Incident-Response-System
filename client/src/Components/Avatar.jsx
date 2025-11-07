import { useState } from "react";

export default function Avatar({ src }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="w-10 h-10 rounded-full ring-2 ring-[#06B6D4]/70 hover:ring-[#06B6D4] transition-all duration-200 flex items-center justify-center bg-[#E0F7FA] overflow-hidden">
      {!loaded && !error && (
        <div className="w-5 h-5 border-2 border-[#06B6D4]/40 border-t-[#06B6D4] rounded-full animate-spin"></div>
      )}
      <img
        src={
          error ? "https://cdn-icons-png.flaticon.com/512/149/149071.png" : src
        }
        alt="User avatar"
        className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
