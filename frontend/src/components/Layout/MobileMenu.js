import React from "react";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";

const MobileMenu = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden mt-4 pb-4 space-y-4">
      <div className="flex flex-col space-y-3">
        <NavLinks mobile onClose={onClose} />
      </div>

      {/* Mobile Search */}
      <div className="px-4 pt-2">
        <SearchBar navigate={navigate} mobile />
      </div>
    </div>
  );
};

export default MobileMenu;
