import OBSWebSocket from 'obs-websocket-js'
import { useEffect, useState } from 'react'

const obs = new OBSWebSocket()

export function useOBS() {
  const [connectStatus, setConnectStatus] = useState<
    'connecting' | 'connected' | 'failed'
  >('connecting')

  useEffect(() => {
    obs
      // .connect('ws://localhost:4444')
      .connect()
      .then(() => setConnectStatus('connected'))
      .catch(() => setConnectStatus('failed'))

    // return () => {
    //   obs
    //     .disconnect()
    //     .then(() => setConnectStatus('connecting'))
    //     .catch(() => setConnectStatus('failed'))
    // }
  }, [])

  return [obs, { connectStatus }] as const
}
