import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useLanguage = create(
  persist(
    (set) => ({
      showChinese: false,

      toggleLanguage: () => {
        set((state) => ({
          showChinese: !state.showChinese,
        }))
      },

      setShowChinese: (value) => {
        set({ showChinese: value })
      },
    }),
    {
      name: 'language-preference',
    }
  )
)

export default useLanguage
