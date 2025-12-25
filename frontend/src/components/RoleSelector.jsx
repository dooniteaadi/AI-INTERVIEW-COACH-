import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

function RoleSelector({ selectedRole, onRoleChange }) {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/roles`)
      setRoles(response.data.roles)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      // Fallback roles
      setRoles([
        'Software Engineer',
        'Data Scientist',
        'Product Manager',
        'UX Designer',
        'DevOps Engineer',
        'Marketing Manager'
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Loading roles...</div>
  }

  return (
    <select
      value={selectedRole}
      onChange={(e) => onRoleChange(e.target.value)}
      className="w-full p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
    >
      <option value="">Select a role...</option>
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  )
}

export default RoleSelector

