import { useEffect, useState } from 'react'
import IntroVideo from './components/IntroVideo'
import RoleSelect from './components/RoleSelect'
import StudentDashboard from './components/StudentDashboard'
import AdminDashboard from './components/AdminDashboard'
import AlarmToast from './components/AlarmToast'
import { rearmAlarms } from './lib/alarms'

export default function App() {
  const [introDone, setIntroDone] = useState(false)
  const [role, setRole] = useState(null) // 'student' | 'admin' | null

  // Restores any task alarms a student set before their last reload.
  useEffect(() => {
    rearmAlarms()
  }, [])

  if (!introDone) {
    return <IntroVideo onFinish={() => setIntroDone(true)} />
  }

  if (!role) {
    return (
      <>
        <RoleSelect onSelect={setRole} />
        <AlarmToast />
      </>
    )
  }

  return (
    <>
      {role === 'admin' ? (
        <AdminDashboard onSwitchRole={() => setRole(null)} />
      ) : (
        <StudentDashboard onSwitchRole={() => setRole(null)} />
      )}
      <AlarmToast />
    </>
  )
}
