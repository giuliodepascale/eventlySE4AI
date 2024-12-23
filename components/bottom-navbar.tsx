"use client";

import React from 'react';
import  Link  from 'next/link';

import { FaHome } from "react-icons/fa";

export const BottomNavBar = () => {
  return (
    <div className="fixed bottom-5 left-10 right-10 flex justify-between items-center bg-white border-t border-gray-200 shadow-lg p-4 z-10 md:hidden rounded-3xl ">
      <Link href="/" className="flex flex-col items-center text-gray-700 hover:text-blue-600">
      <FaHome className="h-5 w-5"/> Home
      </Link>
      <Link href="/search" className="flex flex-col items-center text-gray-700 hover:text-red-500">
        <i className="fas fa-search text-xl mb-1"></i>
        <span className="text-xs">Search</span>
      </Link>
      <Link href="/settings" className="flex flex-col items-center text-gray-700 hover:text-red-500">
        <i className="fas fa-bed text-xl mb-1"></i>
        <span className="text-xs">Bookings</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center text-gray-700 hover:text-red-500">
        <i className="fas fa-user text-xl mb-1"></i>
        <span className="text-xs">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNavBar;