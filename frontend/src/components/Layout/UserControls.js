import React from "react";
import { FaUserCircle } from "react-icons/fa";
import NightToggle from "./NightToggle";

const UserControls = () => (
  <>
    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
      <FaUserCircle size={20} />
    </button>

    <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800">
      <NightToggle className="text-gray-700 dark:text-gray-300" />
    </div>
  </>
);

export default UserControls;
