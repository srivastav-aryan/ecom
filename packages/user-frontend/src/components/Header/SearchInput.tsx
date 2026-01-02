import { Search } from "lucide-react";

function SearchInput() {
  return (
    <>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="text-gray-400" size={20} />
      </div>

      {/* Input Field */}
      <input
        type="text"
        placeholder="Search..."
        className="
          w-full
          py-1.5 md:py-2.5 pl-10 pr-4
          text-gray-900
          bg-white
          border border-gray-300
          rounded-xl
          focus:outline-none focus:ring-2 focus:ring-black focus:border-black
          placeholder-gray-500
          transition duration-150 ease-in-out
        "
      />
    </>
  );
}

export default SearchInput;
