import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Plans from './pages/Plans'
import CreatePlan from './pages/CreatePlan'
import MySubscriptions from './pages/MySubscriptions'
import History from './pages/History'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="plans" element={<Plans />} />
        <Route path="create" element={<CreatePlan />} />
        <Route path="subs" element={<MySubscriptions />} />
        <Route path="history" element={<History />} />
      </Route>
    </Routes>
  )
}

export default App
