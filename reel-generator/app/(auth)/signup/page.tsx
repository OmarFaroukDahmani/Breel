"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"

export default function SignUp() {
    const [data , setData] = useState({
        email : "",
        username : "",
        password : "",
    });
    const [message , setMessage] = useState("");
    const router = useRouter();
    
    const handleSubmit = async (e  : React.FormEvent) =>{
        e.preventDefault();
        setMessage("");

        const res = await fetch("/api/signup", {
            method : "POST",
            headers : {"Content-Type": "application/json"},
            body : JSON.stringify({ email : data.email , username : data.username , password : data.password })
        })

        if (res.ok){
            router.push("/login");
        }else {
            const info = await res.json();
            setMessage(info.message)
            setTimeout(() => { setMessage(""); }, 4000);
            setData({email: "" , username : "" , password :""})
        }
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Account</h1>
        
        {message && (
          <p className="text-red-500 text-sm mb-4 text-center">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={(e) => setData({...data ,  email : e.target.value})}
            className="p-2 border rounded text-black"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={data.username}
            onChange={(e) =>  setData({...data ,  username : e.target.value})}
            className="p-2 border rounded text-black"
            required
           />
          <input
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={(e) =>  setData({...data ,  password : e.target.value})}
            className="p-2 border rounded text-black"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Log in
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
