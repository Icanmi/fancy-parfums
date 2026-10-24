import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/clerk-react'
import { syncUserProfile } from '../../services/adminCustomerService'

export default function UserSync() {
  const { isSignedIn, user } = useUser()
  const lastSyncedId = useRef(null)

  useEffect(() => {
    if (!isSignedIn || !user) return

    const clerkUserId = user.id
    const email = user.primaryEmailAddress?.emailAddress

    if (!email) return

    // Avoid multiple sync calls for the same user in memory
    if (lastSyncedId.current === clerkUserId) return

    const sessionKey = `fa_synced_user_${clerkUserId}`
    const alreadySynced = sessionStorage.getItem(sessionKey)

    if (alreadySynced) {
      lastSyncedId.current = clerkUserId
      return
    }

    async function doSync() {
      try {
        await syncUserProfile({
          clerkUserId,
          email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.primaryPhoneNumber?.phoneNumber || '',
        })
        sessionStorage.setItem(sessionKey, 'true')
        lastSyncedId.current = clerkUserId
      } catch (e) {
        console.warn('User background sync deferred:', e)
      }
    }

    doSync()
  }, [isSignedIn, user])

  return null
}
