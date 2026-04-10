"use client";
import { signOut } from "next-auth/react";

export default function DeleteButton() {
  const handleDelete = async () => {
    const confirmed = confirm("Are you SURE? This cannot be undone.");
    
    if (confirmed) {
      const res = await fetch("/api/user/delete", { method: "DELETE" });

      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-4"
    >
      Delete My Account
    </button>
  );
}