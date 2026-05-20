import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../services/auth.service'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()

    try {
      const res = await signup({
        email,
        password
      })

      console.log(res.data)

      alert('Signup successful')

      nav('/login')

    } catch (err) {
      console.log(err.response?.data)

      alert(JSON.stringify(err.response?.data))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={submit}
        className="p-6 bg-white rounded shadow w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">
          Signup
        </h2>

        <label className="block mb-2">
          Email
        </label>

        <input
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <label className="block mb-2">
          Password
        </label>

        <input
          type="password"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white p-2 rounded">
          Signup
        </button>

        <div className="mt-4 text-sm">
          Already have account?
          <Link
            to="/login"
            className="text-blue-600 ml-2"
          >
            Login
          </Link>
        </div>
      </form>
    </div>
  )
}