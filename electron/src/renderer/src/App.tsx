import { Button } from './components/ui/button'
import { useOBS } from './hooks/use-obs'
import { RootLayout } from './layouts/RootLayout'

export default function App() {
  const [obs, { connectStatus }] = useOBS()

  const onClick = () => {
    console.log(obs)
  }

  return (
    <RootLayout>
      <Button onClick={onClick}>{connectStatus}</Button>
    </RootLayout>
  )
}
