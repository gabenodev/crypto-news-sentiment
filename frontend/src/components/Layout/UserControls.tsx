import React from "react"; // Adaugă acest import
import { FaUserCircle } from "react-icons/fa";
import NightToggle from "./NightToggle";

const UserControls = (): JSX.Element => (
  <>
    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
      <FaUserCircle size={20} />
    </button>
    <NightToggle />
  </>
);

export default UserControls;
