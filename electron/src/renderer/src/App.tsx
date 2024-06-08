import type React from 'react'
import { useEffect, useRef, useState } from 'react'

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([])
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedInputDeviceId, setSelectedInputDeviceId] = useState<string>('')
  const [selectedOutputDeviceId, setSelectedOutputDeviceId] =
    useState<string>('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInputDevices = devices.filter(
        (device) => device.kind === 'audioinput',
      )
      const audioOutputDevices = devices.filter(
        (device) => device.kind === 'audiooutput',
      )
      setInputDevices(audioInputDevices)
      setOutputDevices(audioOutputDevices)

      if (audioInputDevices.length > 0) {
        setSelectedInputDeviceId(audioInputDevices[0].deviceId)
      }
      if (audioOutputDevices.length > 0) {
        setSelectedOutputDeviceId(audioOutputDevices[0].deviceId)
      }
    })
  }, [])

  const startRecording = async () => {
    try {
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )()

      // マイク入力の取得
      const inputStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedInputDeviceId },
      })
      const inputSource = audioContext.createMediaStreamSource(inputStream)

      // システム音声の取得 (仮想オーディオデバイス経由)
      const outputStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedOutputDeviceId },
      })
      const outputSource = audioContext.createMediaStreamSource(outputStream)

      // 2つのストリームを1つにミックスする
      const destination = audioContext.createMediaStreamDestination()
      inputSource.connect(destination)
      outputSource.connect(destination)

      mediaRecorderRef.current = new MediaRecorder(destination.stream)
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
      }
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Error accessing media devices.', err)
    }
  }

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedInputDeviceId(event.target.value)
  }

  const handleOutputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOutputDeviceId(event.target.value)
  }

  return (
    <div>
      <div>
        <label htmlFor="input-devices">Select Input Device:</label>
        <select
          id="input-devices"
          value={selectedInputDeviceId}
          onChange={handleInputChange}
        >
          {inputDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="output-devices">Select Output Device:</label>
        <select
          id="output-devices"
          value={selectedOutputDeviceId}
          onChange={handleOutputChange}
        >
          {outputDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {audioURL && <audio controls src={audioURL} />}
    </div>
  )
}

export default AudioRecorder
