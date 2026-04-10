"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function SignIn() {
    const [data , setData] = useState({
        email : "",
        password : "",
    });
    const [message , setMessage] = useState("");
    const router = useRouter();
    
    const handleSubmit = async (e  : React.FormEvent) =>{
        e.preventDefault();
        setMessage("");

        const res = await signIn("credentials" , {email : data.email , password : data.password , redirect : false });

        if (res?.error){
            setMessage("Invalid email or password");
        }else {
            router.push("/workspace");
            router.refresh();
        }
    };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        
        {message && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={(e) => setData({...data, email: e.target.value})}
            className="p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={(e) => setData({...data, password: e.target.value})}
            className="p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
      <Link 
        href="/" 
        className="mt-8 inline-block text-blue-600 font-medium hover:text-blue-800 transition"
      >
          ← Return to Home
      </Link>
    </div>
  )
}
