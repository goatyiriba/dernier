import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { LocalAuthProvider } from '@/hooks/useLocalAuth'

function App() {
  return (
    <LocalAuthProvider>
      <Pages />
      <Toaster />
    </LocalAuthProvider>
  )
}

export default App 