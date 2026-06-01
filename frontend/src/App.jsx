import { useEffect, useMemo, useState } from 'react'
import { clientServer } from './client'
import './App.css'

const initialAuth = {
  name: '',
  email: '',
  password: '',
}

const initialTask = {
  title: '',
  description: '',
  stage: 'Todo',
}

const stageOrder = ['Todo', 'In Progress', 'Done']

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(initialAuth)
  const [taskForm, setTaskForm] = useState(initialTask)
  const [tasks, setTasks] = useState([])
  const [token, setToken] = useState(() => localStorage.getItem('tm_token') || '')
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tm_user')

    return saved ? JSON.parse(saved) : null
  })
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [taskLoading, setTaskLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const groupedTasks = useMemo(() => {
    return stageOrder.reduce((accumulator, stage) => {
      accumulator[stage] = tasks.filter((task) => task.stage === stage)
      return accumulator
    }, {})
  }, [tasks])

  const request = async (path, options = {}) => {
    try {
      const response = await clientServer.request({
        url: path,
        ...options,
        headers: {
          ...(options.headers || {}),
        },
      })

      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Something went wrong.')
    }
  }

  const handleLogout = (clearMessages = true) => {
    setToken('')
    setUser(null)
    setTasks([])
    setEditingTaskId(null)
    setTaskForm(initialTask)
    localStorage.removeItem('tm_token')
    localStorage.removeItem('tm_user')
    if (clearMessages) {
      setError('')
      setSuccess('')
    }
  }

  const loadTasks = async (authToken = token) => {
    try {
      setPageLoading(true)
      setError('')

      const data = await request('/api/posts', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      setTasks(data)
    } catch (err) {
      setError(err.message)
      setTasks([])
      if (err.message === 'Invalid token.' || err.message === 'No token provided.') {
        handleLogout(false)
      }
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadTasks(token)
    }
  }, [token])

  const handleAuthSubmit = async (event) => {
    event.preventDefault()

    try {
      setAuthLoading(true)
      setError('')
      setSuccess('')

      const endpoint = authMode === 'register' ? '/api/users/register' : '/api/users/login'
      const payload =
        authMode === 'register'
          ? authForm
          : {
              email: authForm.email,
              password: authForm.password,
            }

      const data = await request(endpoint, {
        method: 'POST',
        data: payload,
      })

      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('tm_token', data.token)
      localStorage.setItem('tm_user', JSON.stringify(data.user))
      setAuthForm(initialAuth)
      setSuccess(data.message)
      setAuthMode('login')
      await loadTasks(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleTaskSubmit = async (event) => {
    event.preventDefault()

    try {
      setTaskLoading(true)
      setError('')
      setSuccess('')

      const isEditing = Boolean(editingTaskId)

      const data = await request(isEditing ? `/api/posts/${editingTaskId}` : '/api/posts', {
        method: isEditing ? 'PUT' : 'POST',
        data: taskForm,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (isEditing) {
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task._id === editingTaskId ? data : task)),
        )
        setSuccess('Task updated successfully.')
      } else {
        setTasks((currentTasks) => [data, ...currentTasks])
        setSuccess('Task created successfully.')
      }

      setTaskForm(initialTask)
      setEditingTaskId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setTaskLoading(false)
    }
  }

  const handleEdit = (task) => {
    setEditingTaskId(task._id)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      stage: task.stage,
    })
    setSuccess('')
    setError('')
  }

  const handleDelete = async (taskId) => {
    try {
      setTaskLoading(true)
      setError('')
      setSuccess('')

      await request(`/api/posts/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId))
      setSuccess('Task deleted successfully.')

      if (editingTaskId === taskId) {
        setEditingTaskId(null)
        setTaskForm(initialTask)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setTaskLoading(false)
    }
  }

  const totalTasks = tasks.length

  if (!user || !token) {
    return (
      <main className="auth-shell">
        <section className="hero-panel">
          <p className="eyebrow">Task Manager Assignment</p>
          <h1>Plan work, move it forward, and keep the flow simple.</h1>
          <p className="hero-copy">
            A clean task manager with login, registration, and three stage tracking for Todo,
            In Progress, and Done.
          </p>
          <div className="hero-stats">
            <div>
              <strong>3</strong>
              <span>Task stages</span>
            </div>
            <div>
              <strong>JWT</strong>
              <span>Secure auth</span>
            </div>
            <div>
              <strong>MongoDB</strong>
              <span>Persistent data</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-switch">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <label>
                Full name
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                placeholder="name@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                placeholder="••••••••"
                required
              />
            </label>

            {error && <p className="message error">{error}</p>}
            {success && <p className="message success">{success}</p>}

            <button type="submit" className="primary-button" disabled={authLoading}>
              {authLoading ? 'Please wait...' : authMode === 'register' ? 'Create account' : 'Login'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Task Manager</h1>
        </div>

        <div className="topbar-actions">
          <div className="user-chip">
            <span>{user.name}</span>
            <small>{user.email}</small>
          </div>
          <button type="button" className="ghost-button" onClick={() => handleLogout()}>
            Logout
          </button>
        </div>
      </header>

      <section className="overview-grid">
        <article>
          <span>Total tasks</span>
          <strong>{totalTasks}</strong>
        </article>
        <article>
          <span>Todo</span>
          <strong>{groupedTasks.Todo.length}</strong>
        </article>
        <article>
          <span>In Progress</span>
          <strong>{groupedTasks['In Progress'].length}</strong>
        </article>
        <article>
          <span>Done</span>
          <strong>{groupedTasks.Done.length}</strong>
        </article>
      </section>

      <section className="workspace-grid">
        <aside className="task-form-card">
          <div className="card-title">
            <div>
              <p className="eyebrow">{editingTaskId ? 'Update task' : 'Create task'}</p>
              <h2>{editingTaskId ? 'Edit your task' : 'Add a new task'}</h2>
            </div>
            {editingTaskId && (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setEditingTaskId(null)
                  setTaskForm(initialTask)
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <form className="task-form" onSubmit={handleTaskSubmit}>
            <label>
              Title
              <input
                type="text"
                value={taskForm.title}
                onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                placeholder="Task title"
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={taskForm.description}
                onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
                placeholder="Short task details"
                rows={5}
              />
            </label>

            <label>
              Stage
              <select
                value={taskForm.stage}
                onChange={(event) => setTaskForm({ ...taskForm, stage: event.target.value })}
              >
                {stageOrder.map((stage) => (
                  <option value={stage} key={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="message error">{error}</p>}
            {success && <p className="message success">{success}</p>}

            <button type="submit" className="primary-button" disabled={taskLoading || pageLoading}>
              {taskLoading ? 'Saving...' : editingTaskId ? 'Update task' : 'Create task'}
            </button>
          </form>
        </aside>

        <section className="board-grid">
          {stageOrder.map((stage) => (
            <article className="board-column" key={stage}>
              <div className="column-head">
                <h2>{stage}</h2>
                <span>{groupedTasks[stage].length}</span>
              </div>

              <div className="task-list">
                {pageLoading ? (
                  <p className="empty-state">Loading tasks...</p>
                ) : groupedTasks[stage].length === 0 ? (
                  <p className="empty-state">No tasks here yet.</p>
                ) : (
                  groupedTasks[stage].map((task) => (
                    <article className="task-card" key={task._id}>
                      <div className="task-card-top">
                        <h3>{task.title}</h3>
                        <span>{task.stage}</span>
                      </div>
                      <p>{task.description || 'No description added.'}</p>
                      <div className="task-actions">
                        <button type="button" className="text-button" onClick={() => handleEdit(task)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-button danger"
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

export default App
